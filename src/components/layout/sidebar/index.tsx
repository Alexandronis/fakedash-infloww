import React from 'react';
import './sidebar.scss';
import { sidebarItems } from '../../../data/sidebarData';

const Sidebar: React.FC = () => {
  return (
    <div className="dashboard-sidebar">
      <div className="sidebar-main">
        <ul className="sidebar-link-list">
          {sidebarItems.map((item, index) => {

            if (item.type === "hr") return <hr key={index} />;

            return (
              <li
                key={index}
                className={item.active ? "active" : undefined}
                style={item.style}
              >
                {item.type === "link" ? (
                  <a
                    href={item.href}
                    className={item.className}
                    id={item.id}
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
                  <button type="button" id={item.id}>
                    <img src={item.icon} alt="" /> {item.label}
                    {item.badge && <span className={item.badge.className} />}
                  </button>
                )}

                {item.submenu && (
                  <div className="sub-menu">
                    <ul>
                      {item.submenu.map((sub, i) => (
                        <li key={i}>
                          <a href={sub.href}>
                            <img src={sub.icon} alt="" />
                            {sub.label}
                            {sub.extra && <span>{sub.extra}</span>}
                          </a>
                        </li>
                      ))}
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
