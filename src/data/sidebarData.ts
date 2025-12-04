export const sidebarItems = [
  {
    type: "button",
    style: { marginBottom: "30px" },
    id: "of-top-menu",
    icon: "/of-menu-icon.png",
    label: "Onlyfans",
    badge: { className: "of-badge" },
  },

  {
    type: "link",
    href: "/dashboard",
    icon: "/home-icon.svg",
    label: "Dashboard",
  },

  {
    type: "button",
    icon: "/of-icon.png",
    label: "OF Manager",
    submenu: [
      { href: "#", icon: "/new_post.png", label: "New post" },
      { href: "#", icon: "/notifications.png", label: "Notifications" },
      { href: "#", icon: "/messages_basic_icon.png", label: "Meassges Basic" },
      { href: "#", icon: "/vault_icon.png", label: "Vault" },
      { href: "#", icon: "/queue_icon.png", label: "Queue" },
      { href: "#", icon: "/collections_icon.png", label: "Collections" },
      { href: "#", icon: "/statements_icon.png", label: "Statements" },
      { href: "#", icon: "/statistics_icon.png", label: "Statistics" },
      { href: "#", icon: "/bank_icon.png", label: "Bank" },
      { href: "#", icon: "/my_profile_icon.png", label: "My Profile" },
      { href: "#", icon: "/of_settings_icon.png", label: "OF Settings" },
    ],
  },

  {
    type: "button",
    icon: "/analytics-icon.svg",
    label: "Analytics",
    submenu: [
      { href: "/creator", icon: "/creator-icon.svg", label: "Creator reports" },
      { href: "#", icon: "/person-icon.svg", label: "Employee reports" },
      { href: "#", icon: "/fan-icon.svg", label: "Fan reports" },
      { href: "#", icon: "/message-dashboard-icon.svg", label: "Message dashboard" },
    ],
  },

  {
    type: "link",
    href: "#",
    id: "messages-menu",
    icon: "/messages-pro-icon.png",
    label: "Messages Pro",
    extra: {
      badge: { className: "messages-pro-badge", text: "0" },
      rightIcon: "/messages-pro-right-icon.png",
    },
  },

  {
    type: "button",
    icon: "/growth-icon.svg",
    label: "Growth",
    submenu: [
      { href: "#", icon: "/smart_messages_icon.png", label: "Smart Messages" },
      { href: "#", icon: "/smart_lists_icon.png", label: "Smart lists" },
      { href: "#", icon: "/auto_follow_icon.png", label: "Auto-follow" },
      { href: "#", icon: "/vault_icon-2.png", label: "Vault", extra: "Pro" },
      { href: "#", icon: "/scripts_icon.png", label: "Scripts" },
      { href: "#", icon: "/profile_promotion_icon.png", label: "Profile promotion" },
      { href: "#", icon: "/free_trial_links_icon.png", label: "Free trial links" },
      { href: "#", icon: "/tracking_links_icon.png", label: "Tracking links" },
      { href: "#", icon: "/sensitive_words_icon.png", label: "Sensitive words" },
      { href: "#", icon: "/ai_copilot_icon.png", label: "AI Copilot" },
    ],
  },

  {
    type: "button",
    icon: "/share-icon.svg",
    label: "Share for Share",
    submenu: [
      { href: "#", icon: "/discover_creators_icon.png", label: "Discover Creators" },
      { href: "#", icon: "/requests_icon.png", label: "Requests" },
      { href: "#", icon: "/s4s_schedule_icon.png", label: "S4S Schedule" },
      { href: "#", icon: "/settings-icon.png", label: "S4S Settings" },
    ],
  },

  { type: "hr" },

  {
    type: "button",
    icon: "/creator-icon.svg",
    label: "Creators",
    submenu: [
      { href: "#", icon: "/creator-icon.svg", label: "Manage Creators" },
      { href: "#", icon: "/custom_proxy_icon.png", label: "Custom proxy" },
    ],
  },

  {
    type: "button",
    icon: "/person-icon.svg",
    label: "Employees",
    submenu: [
      { href: "#", icon: "/person-icon.svg", label: "Manage employees" },
      { href: "#", icon: "/shift_schedule_icon.png", label: "Shift schedule" },
    ],
  },
];
