---
slug: contact-import-rfc
title: "Request For Comments: A secure contact import scheme for social networks"
---

*This article lays out plans for a future Bluesky feature \- it doesn’t exist yet\! By sharing our ideas early we hope we can solicit feedback from the community.*

> **TL;DR:** this is a secure way to find people you know by sharing your phone’s contacts with Bluesky. Don’t want to use this? No sweat\! A key feature of this design is that it’s **double opt-in**. If you never use this feature, you will never be findable using your phone number.

Anyone building a social app has to solve the “cold start” problem of bootstrapping dense social graphs. Although Bluesky is a lively place with over 40m users, we want to connect even more people with their friends.

A common industry solution to friend-discovery is to allow users to upload their phone contact lists to find and follow other users. Unfortunately, these systems have been shown to [leak users’ phone numbers](https://contact-discovery.github.io/). Bluesky is unwilling to ship any feature that exposes PII in that way. 

Another concern is consensual usage. The contact upload should only be used for the purpose of finding friends. And then, what if a friend uploads your phone number without you knowing? You shouldn’t show up in these phone-number matches without okaying it yourself.

These issues have meant, until now, we have foregone this common utility.

We believe we have now found a solution to the security risks of contact-list imports, which we will describe in this blogpost. We offer this initial writeup to solicit critical feedback from the community. If you have questions or concerns about the design of this scheme, please raise them here \[link\]

## Requirements

Handling user contact information has security and privacy implications. If we offer a phone-number matching service, we want it to have these properties:

- **Truly “opt-in”**. This feature isn’t for everyone, and those who don’t want it can ignore it without hassle.  
- **Revocable consent**. If you change your mind later, all uploaded data can be removed from our servers.  
- **Specificity**. Uploaded data will *only* be used to help you find your contacts on Bluesky, and for no other purposes.  
- **Security**. We want to keep uploaded phone numbers confidential, even in worst-case scenarios like our servers getting hacked. Enumeration attacks should likewise not be feasible.

In terms of threat modeling, we want to protect the following information:

- Whether a particular phone number belongs to any Bluesky user at all  
- The mapping of specific phone numbers to specific users  
- The uploaded contacts list of each user

And we want to protect against the following types of threat actors:

- An attacker with access to the external API interface  
- An attacker with unauthorized access to internal Bluesky infrastructure

## Threat 1: Enumeration attacks

The most likely threat is an attacker with access to the external API interface trying to enumerate which phone numbers belong to which users. This might sound easy to defend against, but it’s deceptively tricky.

Imagine we have a magical, perfectly secure “black box” computer system. Users upload their contact lists to this system, and nobody can take them back out again. But, the uploader gets back a list of accounts whose phone numbers were on the list in the form of “suggested follows”.

An attacker uploads a contact list filled with 10,000 random phone numbers. There’s only a finite number of phone numbers in the world (on the order of 8 billion), so eventually their random number list will include the phone number of a legitimate user. The attacker gets a notification telling them that a friend has been found, giving them the opportunity to follow this user.

At this point, the attacker knows that this user’s phone number is somewhere on their list of 10,000 numbers, but they don’t know which one. The attacker creates a new account and re-uploads *half* of the initial list, 5,000 phone numbers. If the same user is found again, they know their phone number is in that half of the list; if not, it’s the other half. This process is repeated <math><mrow><mi>O</mi><mo form="prefix" stretchy="false">(</mo><mrow><mi>log</mi><mo>⁡</mo><mspace width="0.1667em"></mspace></mrow><mi>n</mi><mo form="postfix" stretchy="false">)</mo></mrow></math> times, and eventually the attacker will have reduced the list of phone numbers to just one \- and has successfully inferred the phone number of a random Bluesky user.

By scaling this attack up (say, with a bot farm), the attacker could eventually deduce the phone number of every user. Hashing and rate limiting are often used to “solve” this problem, but because there are finitely many phone numbers in the world, none of these solutions are effective. Not good\!

## Solving enumeration attacks

We solve the enumeration attack vector with two steps:

1. Limit discovery to mutual contacts, and  
2. Verify phone number ownership before using it in matches.

We have two users, Alice and Bob. They each verify their own phone numbers before uploading their respective contacts lists. For either user to get a follow recommendation, Bob’s phone number must be in Alice’s submitted contacts list, *and* Alice’s phone number must be in Bob’s submitted contacts list. An attacker’s phone number(s) will never be in the contacts list of any legitimate users, so the attacker will never discover any mutual contacts.

Verifying phone number ownership both increases the overall work for an attacker and prevents them from lying about their phone number.

The downside of this scheme is that it will reduce the overall number of matches, since both sides must participate in the contact import, but we think this is a worthwhile trade for protecting people’s privacy. In fact, we would argue that making people feel safe to use the import is pretty critical to gaining any value at all.

In addition to phone number verification, we need to be careful to rate-limit the number of contact numbers that can be imported by an individual user. This prevents undue load on our systems, and also ensures that a user cannot attempt to enumerate who has *their* phone number as a contact.

## Threat 2: Database leaks

Nobody ever wants to experience a data breach, but good security practices means planning for the worst. The scenario is pretty simple: somehow the service is breached and the phone number registry is leaked. What now?

## Securing against database leaks

The “obvious” approach is to store the cryptographic hash of each phone number, similarly to password-handling best practices. The problem here is that there are simply not very many possible phone numbers, somewhere on the order of 8 billion. A modern GPU could crack a SHA-256 hashed phone number in under a second.

Brute-force resistant hash algorithms like Argon2 are a big improvement on that, but 8 billion phone numbers is still a small search space (<math><msup><mn>2</mn><mn>33</mn></msup></math>), and attackers could construct a Rainbow Table, i.e. a reverse lookup table for every possible phone number. Unlike with password hashing, we cannot use a random salt for each phone number because then we wouldn’t be able to find matches between two users (because mismatched salts would produce different hash outputs).

Since we’re only trying to discover *mutual* contacts, we can store phone numbers in hashed unordered pairs, such that `hash(x, y) == hash(y, x)`. This order-independence can be achieved by sorting the pair of inputs before hashing them. Assuming there are <math><msup><mn>2</mn><mn>33</mn></msup></math> possible phone numbers, then there are <math><msup><mn>2</mn><mn>65</mn></msup></math> possible *pairs* of phone numbers. This makes brute-force attacks much more difficult, and makes Rainbow Tables much less feasible.

*Note: The practical brute-force difficulty will be lower than <math><msup><mn>2</mn><mn>65</mn></msup></math> because real-world pairs of phone numbers are correlated (e.g. more likely to be from the same region). However, it is strictly more difficult to brute-force a hash of a pair of numbers than to brute-force a hash of either number individually.*

Argon2 is a brute-force resistant hash function, so that’s what we’ll be using (specifically, Argon2id). Since we cannot use a randomized salt (as would be typical of a password hashing use case) we will use a fixed salt across all hashes. This still provides a security benefit because the salt value can be stored separately from the database. In the event of a database compromise, the data would be completely useless to attackers without knowledge of the salt. Using a fixed salt like this is often referred to as a “[pepper](https://en.wikipedia.org/wiki/Pepper_\(cryptography\))”

In an ideal world, the pepper would be stored securely inside an [HSM](https://en.wikipedia.org/wiki/Hardware_security_module). However, HSM support for the Argon2 hash function is not ubiquitous, so it will have to be computed outside of an HSM. To achieve an HSM-equivalent level of overall security, we’ll apply a final HMAC to the Argon2 output, using a secret that *is* stored in an HSM (using the HMAC as a keyed hash function, rather than a MAC)

Argon2 provides brute-force resistance, while the final HMAC binds the output hash to a secret stored in a HSM. The overall hash function could be summarised in pseudocode as:

```
def hash(x, y):  
    return HMAC(Argon2id(sort([x, y]), salt=ARGON_SECRET), key=HMAC_SECRET)
```

If user A with phone number pA submits their contacts list `[pB, pC, pD]`, then we’d store the following in our database:

```
hash(pA, pB) -> A
hash(pA, pC) -> A
hash(pA, pD) -> A
```

(where `A` is user A’s user ID)

Later, user B submits their contacts list `[pE, pA]`

The mapping of `hash(pB, pE) -> B` is stored, but `hash(pB, pA)` matches with the earlier inserted `hash(pA, pB)`, associated with user A.

At this point we’ve established that user A and user B are mutual contacts, and we can send follow recommendation notifications to each of them. `hash(pA, pB) -> A` can be removed from the database now, since it’s no longer needed.

## A Complication: Phone Number Recycling

There’s an annoying feature of phone infrastructure that causes trouble for anyone working with it, including us: after some time, disused phone numbers get reclaimed and assigned to new users. Mobile network operators are forced to do this because otherwise there wouldn’t be enough phone numbers to go around. When you set up a phone with a new SIM, there’s a good chance your “new” phone number used to belong to someone else.

Because of our bidirectional verification system (only discovering mutual contacts), the only way this could impact our system is if the old-owner and the new-owner of a phone number both use Bluesky, both use the contact import feature, and both have a mutual contact (i.e. there is a phone number that is common to both of their contacts lists). In such a case, the new-owner would discover the old-owner as a false-positive match (and vice versa).

On the face of it this is a very unlikely scenario, but it could become more statistically significant if the “mutual contact” is some widely-known phone number, like that of a popular restaurant.

To mitigate this we will store an additional boolean alongside each hash, denoting whether the phone number of the inserting user is sorted first in the pair or not. So in the earlier example we would actually store `hash(pA, pB) -> (A, True)` (assuming `pA` < `pB`), and so on.

When user B is submitting their contacts and the matching hash is discovered, the service checks that the boolean matches the expected value. If not, it ignores the match, but updates the stored user ID associated with the hash to match B.

The downside of this approach is that the information in the database would leak statistical information about the relative magnitude of the submitter’s phone number. For example, if user A imports 1000 phone numbers and *all* the boolean field values are True, we can be confident that user A’s phone number has a low magnitude (i.e. it probably starts with a 1). This is not useful information on its own, but it could be used to accelerate a brute-force attack.

We mitigate *this* by sorting according to a custom comparison function that does not produce a [Total Order](https://en.wikipedia.org/wiki/Total_order). In pseudocode:

```
def intransitiveCompare(a, b):
    assert(a != b)
    return sha256(a || SEP || b) > sha256(b || SEP || a)
```

Where `||` denotes concatenation and SEP is a separator string that is guaranteed not to be contained within the inputs. Note that this comparison function preserves [antisymmetry](https://en.wikipedia.org/wiki/Antisymmetric_relation) i.e. `intransitiveCompare(a, b) == !intransitiveCompare(b, a)` for all non-equal values of a and b.

With this comparison function, even a hypothetical phone number of “0” would still be expected to compare greater than a random other phone number with 50% probability. And so, storing these comparison result booleans in the database does not leak any relevant information about the input phone numbers.

## Summary

The following features all work together, to construct a contact discovery system that is highly resistant to data misuse:

- Verification of the user’s own phone number  
- Only revealing mutual contacts  
- Brute-force resistant pairwise hashing, bound to an HSM-stored secret

We resist API-level enumeration, while *also* mitigating the consequences of a full database compromise, all while keeping the system (and its deployment) simple. Deployments of this design could be additionally hardened through use of trusted computing environments, but this is out of scope for our initial plans.

As stated in the introduction, we offer this writeup with the hope of receiving any critiques that might highlight issues with the construction. If you have any concerns to share, please provide them here \[link\].
