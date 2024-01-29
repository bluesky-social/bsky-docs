---
sidebar_position: 3
---

# Data Validation

Some software does not need to worry much about Bluesky or atproto schema validation. For example, client apps and bots can generally assume that data they receive from the Bluesky API is valid, and when they try to create records the PDS is responsible for double-checking schema validation.

Software which consumes directly from the event stream (firehose) should be more careful. And developers designing new tools or clever hacks should be away of some expectations and hard limits around data validation.

If an individual record fails to validate for any reason, the entire record should be ignored, but other records from the same repository should be processed. If there is a problem with the repository commit data or repository structure ("MST"), the repository should be market as invalid, but old content does not need to be de-indexed or purged. As soon as a new valid commit is received, the repository should be marked valid again. This logic mostly relevant to feed generators, AppViews, and moderation services, all of which may be consuming from the firehose.


## Recommended Data Limits

The following are informal guidelines, mostly to communicate order-of-magnitude expectations, and are likely to evolve over time. They are not part of the atproto specification, but if you are pushing the limits here, you may limit interoperability.

**CBOR Record Size:** try to keep individual records to a few dozen KBytes. If you need to store more data, even text data, consider using a blob instead. A reasonable maximum record size limit (`MAX_CBOR_RECORD_SIZE`) is 1 MByte.

Note that event stream (firehose) "frames" may consist of multiple records, and larger limits are recommended for CBOR parsing in general, on the order of 4-5 MBytes.

**JSON Record Size:** the CBOR encoding is "canonical" for records, so focusing only on that encoding would make sense. But sometimes it is good to also have a limit on JSON encoding size. A reasonable limit (`MAX_JSON_RECORD_SIZE`) is 2 MByte.

**General string length:** an overall length limit on strings within a record, including both those with and without Lexicon-specified string lengths. Measured as bytes (UTF-8 encoded). Should try to keep these to tens of KBytes at most. For an upper-bound limit (`MAX_RECORD_STRING_LEN`), reasonable to just rely on the overall CBOR record size limit. Notably, some early implementations had a 8 KByte (8192 bytes) limit.

**General `bytes` length:** same as the string limit, but for binary data (`MAX_RECORD_BYTES_LEN`). Recommend relying on the overall CBOR record size limit.

**CID binary encoding size:** recommend an overall limit (`MAX_CID_BYTES`) of 100 bytes.

**Container nesting depth:** for example, how many layers of map inside an array inside an array, etc. If your CBOR or JSON parsing library supports a limit, the default is probably fine. A reasonable limit (`MAX_CBOR_NESTED_LEVELS`) is 32 levels of nesting.

**Container element count:** for example, how many keys in a map, or elements in an array. If your CBOR or JSON parsing library supports a limit, the default is probably fine. A reasonable limit (`MAX_CBOR_CONTAINER_LEN`) is 128 x 1024 = 131,072 elements.

**Object key string length:** for example, how many bytes (UTF-8 encoded) are allowed in any key of an object. If your CBOR or JSON parsing library supports a limit, the default is probably fine. A reasonable limit (`MAX_CBOR_OBJECT_KEY_LEN`) is 8 KBYte (8192).

**Integers:** as mentioned [in the atproto specification](https://atproto.com/specs/data-model#data-types), it is a strongly recommended best practice to keep integer values "64-bit float safe", meaning restricting them to 53 bits of precision. This ensures compatibility with Javascript without loss of numeric precision. The specific values are `MAX_SAFE_INTEGER: 9007199254740991` and `MIN_SAFE_INTEGER: -9007199254740991`.


## Validation Without Schema

The [atproto Lexicon system](https://atproto.com/specs/lexicon) describes a data model and schema language for validating data against a known schema. But what if you are processing data where the schema isn't known or present?

Here are some guidelines, by data type:

* `integer`: should have values within safe limits (discussed in limits section)
* `string`: must be valid UTF-8 encoding. No particular Unicode normalization is expected or required. Empty strings are allowed, but it is preferred to take advantage of nullable or optional fields if possible.
* `bytes`: may be empty (length 0)
* `cid-link`: as discussed in the protocol specification: must be CIDv1; multibase should be raw in CBOR encoding (type `0x00`); multicodec should be `dag-cbor` (`0x71`) or `raw` (`0x55`); and multihash type SHA-256 is encouraged (but not strictly required)
- `array`: may have elements of heterogeneous type, because of the flexibility Lexicon unions provide.
- `object`: key should all be strings, and follow similar data requirements to `string` fields. Empty key strings are not allowed. Key names starting with `$` are reserved for protocol use (for example, `$bytes` and `$type`)
- `blob`: the `ref` must be a valid `cid-link`, and have `raw` multicodec (not `dag-cbor`). `size` may not be negative. `mimeType` can not be an empty string. The "legacy" blob format should be supported for reading, but new records created must be the regular blob format.
