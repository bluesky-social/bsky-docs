import React, { useEffect, useState, useRef } from 'react';
import Isotope from 'isotope-layout';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import styles from './showcase.module.css';
import { PROJECT_TAGS, PROJECTS} from './data/data';

function Showcase() {
    const [titleFilter, setTitleFilter] = useState("");  // State for title filter
    const [selectedTags, setSelectedTags] = useState([]);  // State for selected tags

    // Update this to filter projects based on both title and selected tags
    const filteredProjects = PROJECTS.filter(project =>
        (selectedTags.length === 0 || project.tags.some(tag => selectedTags.includes(tag))) &&
        (titleFilter === "" || project.title.toLowerCase().includes(titleFilter.toLowerCase()))
    );

    useEffect(() => {
        const iso = new Isotope('#showcase', {
            itemSelector: '.tile',
            layoutMode: 'fitRows'
        });

        return () => {
            iso.destroy();
        };
    }, [filteredProjects]);


    const handleTagClick = (tag) => {
        setSelectedTags(prevSelectedTags => {
            if (prevSelectedTags.includes(tag)) {
                return prevSelectedTags.filter(selectedTag => selectedTag !== tag);  // Remove tag if already selected
            } else {
                return [...prevSelectedTags, tag];  // Add tag if not selected
            }
        });
    };

    return (
        <div>
            <div className={styles.titleContainer}>
                <h1 className={styles.title}>Project Showcase</h1>
                <h2 className={styles.subtitle}>Explore third-party projects built with the Bluesky API.</h2>
            </div>
            <div className={styles.tagBar}>
                {PROJECT_TAGS.map(tag => (
                    <button
                        className={`${styles.tagButton}${selectedTags.includes(tag) ? ` ${styles.selectedTagButton}` : ''}`}
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                    >
                        {tag}
                    </button>
                ))}
            </div>
            <input
                type="text"
                onChange={(e) => setTitleFilter(e.target.value)}  // Update to setTitleFilter
                placeholder="Search by title"
            />
            
            <div id="showcase" className={styles.showcase}>
                {filteredProjects.map(project => (
                    <div className="tile" data-tags={project.tags.join(' ')} key={project.title} className={styles.tile}>                        
                        <h3>{project.title}</h3>
                        <p>Tags: {project.tags.join(', ')}</p>
                        <a href={project.url} target="_blank">Learn More</a>
                    </div>
                ))}
            </div>
        </div>
    );
}


export default function Projects() {
    const { siteConfig } = useDocusaurusContext();
    return (
        <Layout
            title="Bluesky Projects"
            description="Explore third-party projects built with the Bluesky API.">
            <main>
                <Showcase />
            </main>
        </Layout>
    );
}
