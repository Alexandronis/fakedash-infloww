import React from 'react';
import './sidebar.scss';

const Sidebar: React.FC = () => {
  return (
    <div className="dashboard-sidebar">
      <div className="sidebar-main">
        <ul className="sidebar-link-list">
          <li className="active" style={{marginBottom: '30px'}}>
            <button type="button" id="of-top-menu">
              <img src="/of-menu-icon.png" alt="" />
              Onlyfans
              <span className="of-badge" />
            </button>
          </li>
          <li>
            <a href="#" className="active"><img src="/home-icon.svg" alt="" /> Dashboard</a>
          </li>
          <li>
            <button type="button">
              <img src="/of-icon.png" alt="" /> OF Manager
            </button>
            <div className="sub-menu">
              <ul>
                <li><a href="#"><img src="/new_post.png" alt="" /> New
                  post</a></li>
                <li><a href="#"><img src="/notifications.png" alt="" /> Notifications</a>
                </li>
                <li><a href="#"><img src="/messages_basic_icon.png" alt="" />Meassges
                  Basic</a></li>
                <li>
                  <a href="#"><img src="/vault_icon.png" alt="" />Vault</a>
                </li>
                <li>
                  <a href="#"><img src="/queue_icon.png" alt="" />Queue</a>
                </li>
                <li><a href="#"><img src="/collections_icon.png" alt="" />Collections</a>
                </li>
                <li><a href="#"><img src="/statements_icon.png" alt="" />Statements</a>
                </li>
                <li><a href="#"><img src="/statistics_icon.png" alt="" />Statistics</a>
                </li>
                <li>
                  <a href="#"><img src="/bank_icon.png" alt="" />Bank</a>
                </li>
                <li><a href="#"><img src="/my_profile_icon.png" alt="" />My
                  Profile</a></li>
                <li><a href="#"><img src="/of_settings_icon.png" alt="" />OF
                  Settings</a></li>
              </ul>
            </div>
          </li>
          <li>
            <button type="button">
              <img src="/analytics-icon.svg" alt="" /> Analytics
            </button>
            <div className="sub-menu">
              <ul>
                <li><a href="creator.html"><img src="/creator-icon.svg" alt="" />Creator reports</a></li>
                <li><a href="#"><img src="/person-icon.svg" alt="" />Employee
                  reports</a></li>
                <li><a href="#"><img src="/fan-icon.svg" alt="" />Fan
                  reports</a></li>
                <li><a href="#"><img src="/message-dashboard-icon.svg" alt="" />Message
                  dashboard</a></li>
              </ul>
            </div>
          </li>
          <li>
            <a href="#" id="messages-menu">
              <img src="/messages-pro-icon.png" alt="" /> Messages Pro
                <span className="messages-pro-badge">0</span>
                <img src="/messages-pro-right-icon.png" className="messages-right-icon" alt="" />
            </a>
          </li>
          <li>
            <button type="button">
              <img src="/growth-icon.svg" alt="" /> Growth
            </button>
            <div className="sub-menu">
              <ul>
                <li><a href="#"><img src="/smart_messages_icon.png" alt="" />Smart
                  Messages</a></li>
                <li><a href="#"><img src="/smart_lists_icon.png" alt="" />Smart lists</a></li>
                <li><a href="#"><img src="/auto_follow_icon.png" alt="" />Auto-follow</a>
                </li>
                <li><a href="#"><img src="/vault_icon-2.png" alt="" />Vault
                  <span>Pro</span></a></li>
                <li><a href="#"><img src="/scripts_icon.png" alt="" />Scripts</a>
                </li>
                <li><a href="#"><img src="/profile_promotion_icon.png" alt="" />Profile
                  promotion</a></li>
                <li><a href="#"><img src="/free_trial_links_icon.png" alt="" />Free
                  trial links</a></li>
                <li><a href="#"><img src="/tracking_links_icon.png" alt="" />Tracking
                  links</a></li>
                <li><a href="#"><img src="/sensitive_words_icon.png" alt="" />Sensitive
                  words</a></li>
                <li><a href="#"><img src="/ai_copilot_icon.png" alt="" />AI
                  Copilot</a></li>
              </ul>
            </div>
          </li>
          <li>
            <button type="button">
              <img src="/share-icon.svg" alt="" /> Share for Share
            </button>
            <div className="sub-menu">
              <ul>
                <li><a href="#"><img src="/discover_creators_icon.png" alt="" />Discover
                  Creators</a></li>
                <li><a href="#"><img src="/requests_icon.png" alt="" />Requests</a>
                </li>
                <li><a href="#"><img src="/s4s_schedule_icon.png" alt="" />S4S
                  Schedule</a></li>
                <li><a href="#"><img src="/settings-icon.png" alt="" />S4S
                  Settings</a></li>
              </ul>
            </div>
          </li>
          <hr />
            <li>
              <button type="button">
                <img src="/creator-icon.svg" alt="" /> Creators
              </button>
              <div className="sub-menu">
                <ul>
                  <li><a href="#"><img src="/creator-icon.svg" alt="" />Manage
                    Creators</a></li>
                  <li><a href="#"><img src="/custom_proxy_icon.png" alt="" />Custom
                    proxy</a></li>
                </ul>
              </div>
            </li>
            <li>
              <button type="button">
                <img src="/person-icon.svg" alt="" /> Employees
              </button>
              <div className="sub-menu">
                <ul>
                  <li><a href="#"><img src="/person-icon.svg" alt="" />Manage
                    employees</a></li>
                  <li><a href="#"><img src="/shift_schedule_icon.png" alt="" />Shift
                    schedule</a></li>
                </ul>
              </div>
            </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
