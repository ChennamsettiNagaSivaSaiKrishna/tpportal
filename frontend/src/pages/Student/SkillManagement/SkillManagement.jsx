import React, { useState, useEffect, useMemo } from 'react';
import API from '../../../services/api';
import './SkillManagement.css';

const SkillManagement = ({ studentRoll, activeSkillsList, onSkillListUpdated }) => {
  const [masterInventory, setMasterInventory] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(null);

  // Search, Filter, and Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const RECORDS_PER_PAGE = 5;

  // TOAST POPUP STATE: Manages message and visibility
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  // Helper method to trigger the smooth popup message
  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast({ visible: false, message: '', type: 'success' });
    }, 3000); // Popup stays visible for exactly 3 seconds
  };

  useEffect(() => {
    const fetchMasterCatalog = async () => {
      try {
        const res = await API.get("/assessment/master-skills-inventory");
        if (res.data.success) {
          setMasterInventory(res.data.inventory || []);
        }
      } catch (err) {
        console.error("Failed to load global database catalog pool.", err);
      }
    };
    fetchMasterCatalog();
  }, []);

  const availableSkills = useMemo(() => {
    return masterInventory.filter(
      (masterItem) => !(activeSkillsList || []).some(
        (activeItem) => activeItem.skill_name === masterItem.skill_name
      )
    );
  }, [masterInventory, activeSkillsList]);

  const filteredCatalog = useMemo(() => {
    setCurrentPage(1); 
    return availableSkills.filter((skill) => {
      const matchesSearch = (skill.skill_name || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || skill.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [availableSkills, searchQuery, selectedCategory]);

  const paginatedSkills = useMemo(() => {
    const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
    return filteredCatalog.slice(startIndex, startIndex + RECORDS_PER_PAGE);
  }, [filteredCatalog, currentPage]);

  const totalPages = Math.ceil(filteredCatalog.length / RECORDS_PER_PAGE) || 1;

  const handleLinkSkillClick = async (skillName) => {
    setSubmitLoading(skillName);
    try {
      const res = await API.post("/assessment/skills/add-node", {
        student_roll: studentRoll,
        skill_name: skillName
      });

      if (res.data.success) {
        // FIXED: Replaced ugly alert() with your new custom Toast Popup
        showToast(`${skillName} attached to your tracking matrix profile!`, 'success');
        if (onSkillListUpdated) onSkillListUpdated();
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to link catalog selection.", 'error');
    } finally {
      setSubmitLoading(null);
    }
  };

  return (
    <div className="skill-management-card">
      {/* TOAST POPUP PORTAL NOTIFICATION VIEW */}
      {toast.visible && (
        <div className={`toast-popup-window ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          <div className="toast-accent-bar"></div>
          <span className="toast-message-txt">{toast.message}</span>
        </div>
      )}

      <div className="skill-mgmt-header">
        <h3 className="skill-mgmt-title">Explore Skill Repositories</h3>
        <p className="skill-mgmt-desc">Browse through available domain proficiencies and append them to your tracking view sheet.</p>
      </div>

      <div className="catalog-control-bar">
        <input
          type="text"
          placeholder="Search catalog skills..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="catalog-search-node"
        />
        <div className="catalog-filter-row">
          {["All", "Programming", "Web Development", "Cloud", "DevOps"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`catalog-filter-pill ${selectedCategory === cat ? "active-catalog-pill" : ""}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="catalog-table-wrapper">
        <table className="catalog-data-table">
          <thead>
            <tr>
              <th>Skill Taxonomy</th>
              <th>Domain Stack</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedSkills.length === 0 ? (
              <tr>
                <td colSpan="3" className="catalog-empty-notice">No unlinked catalog elements match your query filters.</td>
              </tr>
            ) : (
              paginatedSkills.map((skill) => (
                <tr key={skill.id} className="catalog-data-row">
                  <td className="catalog-cell-bold">{skill.skill_name}</td>
                  <td><span className="catalog-tag-pill">{skill.category || 'General'}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleLinkSkillClick(skill.skill_name)}
                      disabled={submitLoading !== null}
                      className="catalog-action-btn"
                    >
                      {submitLoading === skill.skill_name ? "Adding..." : "Add to Profile"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredCatalog.length > RECORDS_PER_PAGE && (
        <div className="catalog-pagination-footer">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="pagination-arrow-btn"
          >
            &larr; Previous
          </button>
          <span className="pagination-text-indicator">
            Page <strong>{currentPage}</strong> of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className="pagination-arrow-btn"
          >
            Next &rarr;
          </button>
        </div>
      )}
    </div>
  );
};

export default SkillManagement;