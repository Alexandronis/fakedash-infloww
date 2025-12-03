import React, { useState, useEffect } from 'react';
import { sidebarItems } from '../../../data/sidebarData';
import './sidebar.scss';

const Sidebar: React.FC = () => {
  const [expandedMainIndex, setExpandedMainIndex] = useState<number | null>(null);
  const [urlActive, setUrlActive] = useState<{ parent: number | null; index: number | null }>({
    parent: null,
    index: null,
  });

  // Auto-detect active item based on current URL
  useEffect(() => {
    const path = window.location.pathname;

    sidebarItems.forEach((item, index) => {
      // MAIN link matches URL
      if (item.type === "link" && item.href === path) {
        setUrlActive({ parent: null, index });
        setExpandedMainIndex(index); // open main item
      }

      // SUBMENU link matches URL
      if (item.submenu) {
        item.submenu.forEach((sub, i) => {
          if (sub.href === path) {
            setUrlActive({ parent: index, index: i });
            setExpandedMainIndex(index); // expand parent
          }
        });
      }
    });
  }, []);

  const handleMainClick = (index: number) => {
    // Toggle expand/collapse
    if (expandedMainIndex === index) {
      setExpandedMainIndex(null);
    } else {
      setExpandedMainIndex(index);
    }
  };

  const handleSubClick = (parentIndex: number, subIndex: number) => {
    // Update URL-based active submenu
    setUrlActive({ parent: parentIndex, index: subIndex });
    setExpandedMainIndex(parentIndex); // ensure parent is expanded

    // If the user clicks a submenu of a different parent than `/creator`, remove `/creator` main active
    if (!(parentIndex === urlActive.parent && subIndex === urlActive.index)) {
      // nothing to do here, the expandedMainIndex already controls main highlight
    }
  };

  return (
    <div className="dashboard-sidebar">
      <div className="sidebar-main">
        <ul className="sidebar-link-list">
          {sidebarItems.map((item, index) => {
            if (item.type === "hr") return <hr key={index} />;

            const isMainActive =
              index === 0 || // OF top menu always active
              expandedMainIndex === index;

            return (
              <li key={index} style={item.style}>
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
                          urlActive.parent === index && urlActive.index === i;

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
