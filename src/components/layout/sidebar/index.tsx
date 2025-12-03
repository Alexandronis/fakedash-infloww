import React, { useState } from 'react';
import { sidebarItems } from '../../../data/sidebarData';
import './sidebar.scss';

const Sidebar: React.FC = () => {
  const [activeMainIndex, setActiveMainIndex] = useState<number | null>(null);
  const [activeSubIndex, setActiveSubIndex] = useState<{
    parent: number | null;
    index: number | null;
  }>({ parent: null, index: null });

  const handleMainClick = (index: number) => {
    // Toggle logic:
    if (activeMainIndex === index) {
      // It is already active → deactivate it
      setActiveMainIndex(null);
      setActiveSubIndex({ parent: null, index: null });
      return;
    }

    // Otherwise activate it
    setActiveMainIndex(index);
    setActiveSubIndex({ parent: null, index: null });
  };

  const handleSubClick = (parentIndex: number, subIndex: number) => {
    setActiveMainIndex(parentIndex);
    setActiveSubIndex({ parent: parentIndex, index: subIndex });
  };

  return (
    <div className="dashboard-sidebar">
      <div className="sidebar-main">
        <ul className="sidebar-link-list">
          {sidebarItems.map((item, index) => {

            if (item.type === "hr") return <hr key={index} />;

            const isMainActive =
              index === 0 ||
              activeMainIndex === index;

            return (
              <li
                key={index}
                style={item.style}
              >
                {item.type === "link" ? (
                  <a
                    href={item.href}
                    className={`${item.className || ""} ${isMainActive ? "active" : ""}`}
                    id={item.id}
                    onClick={() => handleMainClick(index)}
                  >
                    <img src={item.icon} alt="" /> {item.label}
                    {item.extra?.badge && (
                      <span className={item.extra.badge.className}>
                        {item.extra.badge.text}
                      </span>
                    )}
                    {item.extra?.rightIcon && (
                      <img
                        src={item.extra.rightIcon}
                        className="messages-right-icon"
                        alt=""
                      />
                    )}
                  </a>
                ) : (
                  <button
                    type="button"
                    id={item.id}
                    className={isMainActive ? "active" : ""}
                    onClick={() => handleMainClick(index)}
                  >
                    <img src={item.icon} alt="" /> {item.label}
                    {item.badge && <span className={item.badge.className} />}
                  </button>
                )}

                {item.submenu && (
                  <div className="sub-menu">
                    <ul>
                      {item.submenu.map((sub, i) => {
                        const isSubActive =
                          activeSubIndex.parent === index &&
                          activeSubIndex.index === i;

                        return (
                          <li key={i}>
                            <a
                              href={sub.href}
                              className={isSubActive ? "active" : ""}
                              onClick={() => handleSubClick(index, i)}
                            >
                              <img src={sub.icon} alt="" />
                              {sub.label}
                              {sub.extra && <span>{sub.extra}</span>}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
