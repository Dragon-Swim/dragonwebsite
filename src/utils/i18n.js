/**
 * i18n Utility — Dragon Swim Team
 * All user-facing text is stored here, keyed by locale.
 * Default: 'en'. Add more locales here in the future.
 */

const translations = {
    en: {
        // Navigation
        nav_home: 'Home',
        nav_registration: 'Registration',
        nav_contact: 'Contact',
        nav_signin: 'Sign In',

        // Home Page
        hero_title: 'Train, Compete & Grow with',
        hero_subtitle: 'Join our competitive swim team and unlock your full potential in the water. Seasonal programs for all skill levels.',
        hero_cta: 'Register Now',
        hero_cta_secondary: 'Learn More',
        home_mission_badge: 'Our Mission',
        home_mission_title: 'Mission & Vision',
        home_mission_text: 'Dragon Swim is a safe and supportive environment for every athlete. Our goal is to maximize safety, comfort, and protection for all swimmers while bringing out the best in each of them. Our mission is to provide access to both developmental and competitive pathways, emphasizing individual progress, team unity, and family participation.',
        home_journey_badge: 'Our Journey',
        home_team_title: 'Meet The Team',
        home_team_subtitle: 'Dedicated professionals committed to helping you reach your full potential in the water.',
        home_leadership_badge: 'Leadership',
        home_coaches_title: 'Meet Our Coaches',
        home_cta_title: 'Ready to Dive In?',
        home_cta_subtitle: 'Join Dragon Swim Team today and start your competitive journey.',
        home_cta_coach: 'Talk to a Coach',
        about_title: 'About Dragon Swim',
        about_text: 'Dragon Swim Team is a year-round competitive and recreational swimming program dedicated to developing swimmers of all ages and abilities. Our experienced coaching staff provides personalized training through seasonal programs designed to build technique, endurance, and team spirit.',
        seasons_title: 'Our Seasons',
        seasons_subtitle: 'Join us any time of year. Each season offers a unique training focus.',
        season_spring: 'Spring',
        season_spring_dates: 'March – May',
        season_spring_desc: 'Spring brings the thrilling culmination of our Short Course (25-yard) season, immediately followed by a major shift in training environment.',
        season_summer: 'Summer',
        season_summer_dates: 'June – August',
        season_summer_desc: 'Summer is all about long-course speed and power, culminating in the grand finale of our competitive year.',
        season_fall: 'Fall',
        season_fall_dates: 'September – November',
        season_fall_desc: 'Following the summer rest period, the Fall season marks the official start of our new swim year. The primary focus during these months is aerobic base building and technical refinement.',
        season_winter: 'Winter',
        season_winter_dates: 'December – February',
        season_winter_desc: 'Winter is the crucible of our training year—acting much like an academic mid-term. Training volume and intensity ramp up as we prepare swimmers for the championship season ahead.',
        why_title: 'Why Dragon Swim?',
        why_coaching: 'Expert Coaching',
        why_coaching_desc: 'Our certified coaches bring years of competitive and coaching experience.',
        why_community: 'Strong Community',
        why_community_desc: 'Be part of a supportive team that celebrates every achievement.',
        why_flexibility: 'Flexible Scheduling',
        why_flexibility_desc: 'Multiple practice times to fit your busy schedule.',
        why_growth: 'Personal Growth',
        why_growth_desc: 'Develop discipline, confidence, and lifelong fitness habits.',

        // Registration Page
        reg_title: 'Season Registration',
        reg_subtitle: 'Register your family to start training with Dragon Swim.',
        reg_select_season: 'Select a Season',

        // Parent / Guardian
        reg_parent_title: 'Parent / Guardian',
        reg_first: 'First Name',
        reg_last: 'Last Name',
        reg_middle: 'Middle Name',
        reg_middle_optional: 'Middle Name (Optional)',
        reg_gender: 'Gender',
        reg_gender_male: 'Male',
        reg_gender_female: 'Female',
        reg_phone: 'Phone Number',
        reg_email: 'Email Address',
        reg_address: 'Home Address',
        reg_parent_add_spouse: 'Add spouse / partner information',

        // Spouse
        reg_spouse_title: 'Spouse / Partner',

        // Swimmers (children)
        reg_swimmers_title: 'Swimmers',
        reg_swimmer_first: 'First Name',
        reg_swimmer_last: 'Last Name',
        reg_swimmer_middle: 'Middle Name (Optional)',
        reg_swimmer_gender: 'Gender',
        reg_swimmer_dob: 'Date of Birth',
        reg_swimmer_usa_id: 'USA Swimming ID (Optional)',
        reg_swimmer_join_date: 'Join Date (Optional)',
        reg_swimmer_add: '+ Add Another Swimmer',
        reg_swimmer_remove: 'Remove',

        // Emergency Contact
        reg_emergency_title: 'Emergency Contact',
        reg_emergency_name: 'Contact Name',
        reg_emergency_phone: 'Contact Phone',

        // Notes & Submit
        reg_notes: 'Additional Notes',
        reg_submit: 'Submit Registration',
        reg_success: 'Registration submitted successfully! We\'ll be in touch soon.',

        // SafeSport
        safesport_badge: 'Compliance',
        safesport_title: 'USA SafeSport Compliance',
        safesport_intro: 'Dragon Swim Team is committed to maintaining a safe, positive, and respectful environment for all athletes, coaches, and families. Below are essential SafeSport resources for reporting concerns, understanding policies, and upholding our shared responsibility to protect every participant.',

        // Contact Page
        contact_page_title: 'Contact a Coach',
        contact_page_subtitle: 'Get in touch with a coach to evaluate your placement.',
        contact_name_label: 'First & Last Name',
        contact_email_label: 'Email Address',
        contact_phone_label: 'Phone Number (Optional)',
        contact_reason_label: 'Reason for Contact',
        contact_reason_placeholder: 'Select a reason...',
        contact_reason_tryout: 'Schedule a Tryout',
        contact_reason_meet: 'Register for a Meet',
        contact_reason_question: 'General Questions',
        contact_date_label: 'Preferred Date (If applicable)',
        contact_details_label: 'Additional Details',
        contact_details_placeholder: 'Tell us roughly your experience level so we can pair you with the right coach, or any other details.',
        contact_btn_send: 'Send Email',
        contact_success_message: 'Appointment request sent! A coach will be in touch shortly.',
        contact_alert_failed: 'Failed to send message. Please try again.',
        // Legacy keys — keep for reference
        contact_title: 'Contact Our Coaches',
        contact_subtitle: 'Have questions? Reach out to our coaching team directly.',
        contact_coaches_title: 'Meet the Coaches',
        contact_form_title: 'Send a Message',
        contact_name: 'Your Name',
        contact_email: 'Your Email',
        contact_subject: 'Subject',
        contact_message: 'Message',
        contact_send: 'Send Message',
        contact_success: 'Message sent! Our team will get back to you shortly.',
        contact_hours_title: 'Office Hours',
        contact_hours: 'Monday – Friday: 4:00 PM – 7:00 PM',
        contact_email_address_text: 'Email Us',
        contact_email_address: 'dragonswim@outlook.com',

        // Sign In Page
        signin_title: 'Welcome Back',
        signin_subtitle: 'Sign in to manage your registrations and communicate with coaches.',
        signin_email: 'Email Address',
        signin_password: 'Password',
        signin_btn: 'Sign In',
        signin_forgot: 'Forgot password?',
        signin_no_account: 'Don\'t have an account?',
        signin_signup_link: 'Sign Up',
        signup_title: 'Create Account',
        signup_name: 'Full Name',
        signup_email: 'Email Address',
        signup_password: 'Password',
        signup_confirm: 'Confirm Password',
        signup_btn: 'Create Account',
        signup_has_account: 'Already have an account?',
        signup_signin_link: 'Sign In',
        signin_google: 'Continue with Google',

        // Forgot Password
        signin_forgot_title: 'Reset Password',
        signin_forgot_subtitle: "Enter your email and we'll send you a reset link.",
        signin_forgot_email: 'Email Address',
        signin_forgot_btn: 'Send Reset Email',
        signin_forgot_success: 'Password reset email sent! Check your inbox.',
        signin_forgot_back: 'Back to sign in',
        signin_forgot_error: 'Unable to send reset email. Please verify your email address.',

        // Footer
        footer_tagline: 'Training champions in and out of the water.',
        footer_links: 'Quick Links',
        footer_contact: 'Get in Touch',
        footer_rights: '© 2026 Dragon Swim Team. All rights reserved.',

        // ── Dashboard — Common ──
        dash_loading: 'Loading your Dragon dashboard...',
        dash_load_failed_title: 'Failed to load dashboard',
        dash_load_failed_msg: 'Something went wrong while setting up your workspace. This might be due to a connection issue or a configuration error.',
        dash_load_failed_retry: 'Retry Loading',
        dash_unknown_error: 'Unknown error',
        dash_sidebar_menu: 'Menu',
        dash_sidebar_system: 'System',
        dash_sidebar_admin: 'Admin Panel',
        dash_sidebar_messages: 'Messages',
        dash_sidebar_theme: 'Theme',
        dash_sidebar_signout: 'Sign Out',
        dash_user_menu_profile: '👤 Profile',
        dash_user_menu_admin: '⚙️ Admin Panel',
        dash_user_menu_signout: '🚪 Sign Out',

        // ── Dashboard — Swimmer ──
        dash_swimmer_overview_label: 'Overview',
        dash_swimmer_profile_label: 'Profile',
        dash_swimmer_plans_label: 'Swim Plans',
        dash_swimmer_meets_label: 'Swim Meets',
        dash_swimmer_schedule_label: 'Schedule',
        dash_swimmer_tab_overview: 'Dashboard',
        dash_swimmer_tab_profile: 'Family Profile',
        dash_swimmer_tab_plans: 'Swim Plans',
        dash_swimmer_tab_meets: 'Swim Meets',
        dash_swimmer_tab_schedule: 'Practice Schedule',
        dash_swimmer_overview_sub: 'Overview of your swim season at a glance',
        dash_swimmer_profile_sub: 'Manage your family information and swimmers',
        dash_swimmer_plans_sub: 'Track and manage your training plans',
        dash_swimmer_meets_sub: 'View registered and upcoming competitions',
        dash_swimmer_schedule_sub: 'Your weekly practice timetable',
        dash_swimmer_username_fallback: 'Swimmer',
        dash_swimmer_total_plans: 'Total Plans',
        dash_swimmer_active_plans: 'Active Plans',
        dash_swimmer_completed: 'Completed',
        dash_swimmer_upcoming_meets: 'Upcoming Meets',
        dash_swimmer_active_plans_title: 'Active Swim Plans',
        dash_swimmer_upcoming_meets_title: 'Upcoming Meets',
        dash_swimmer_today_practice: 'Today\'s Practice',
        dash_swimmer_rest_day: 'No practices scheduled for today',
        dash_plans_under_construction: '🚧 Under Construction',

        // ── Dashboard — Coach ──
        dash_coach_menu: 'Coach Menu',
        dash_coach_overview_label: 'Overview',
        dash_coach_roster_label: 'Swimmer Roster',
        dash_coach_meets_label: 'Meet Management',
        dash_coach_schedule_label: 'Practice Schedule',
        dash_coach_tab_overview: 'Coach Dashboard',
        dash_coach_tab_roster: 'Team Roster',
        dash_coach_tab_meets: 'Meet Management',
        dash_coach_tab_schedule: 'Season Schedule',
        dash_coach_topbar_sub: 'Managing the Dragon Swim Team roster and sessions',
        dash_coach_badge: 'Coach Mode',
        dash_coach_username_fallback: 'Coach',
        dash_coach_active_athletes: 'Active Athletes',
        dash_coach_new_registrations: 'New Registrations (30d)',
        dash_coach_upcoming_meets: 'Upcoming Meets',
        dash_coach_registered_families: 'Registered Families',
        dash_coach_top_athletes: 'Top Athletes',
        dash_coach_recent_registrations: 'Recent Registrations',
        dash_coach_no_swimmers: 'No swimmers registered yet.',
        dash_coach_no_recent: 'No recent registrations.',
        dash_coach_roster_title: 'Team Roster',
        dash_coach_roster_name: 'Name',
        dash_coach_roster_parent: 'Parent',
        dash_coach_roster_age: 'Age',
        dash_coach_roster_gender: 'Gender',
        dash_coach_roster_usa_id: 'USA ID',

        // ── Dashboard — Profile Tab ──
        dash_profile_no_reg: 'No family registration found.',
        dash_profile_complete_reg: 'Complete Registration',
        dash_profile_parent_title: 'Parent / Guardian',
        dash_profile_edit: 'Edit',
        dash_profile_name: 'Name',
        dash_profile_gender: 'Gender',
        dash_profile_email: 'Email',
        dash_profile_phone: 'Phone',
        dash_profile_address: 'Address',
        dash_profile_spouse_title: 'Spouse / Partner',
        dash_profile_emergency_title: 'Emergency Contact',
        dash_profile_save: 'Save',
        dash_profile_cancel: 'Cancel',
        dash_profile_swimmers_title: 'Swimmers',
        dash_profile_add_swimmer: '+ Add',
        dash_profile_no_swimmers: 'No swimmers registered.',
        dash_profile_swimmer_first: 'First Name',
        dash_profile_swimmer_last: 'Last Name',
        dash_profile_swimmer_middle: 'Middle Name',
        dash_profile_swimmer_gender: 'Gender',
        dash_profile_swimmer_dob: 'Date of Birth',
        dash_profile_swimmer_usa_id: 'USA Swimming ID',
        dash_profile_save_swimmer: 'Save Swimmer',
        dash_profile_cancel_swimmer: 'Cancel',
        dash_profile_select_gender: 'Select...',
        dash_profile_gender_male: 'Male',
        dash_profile_gender_female: 'Female',
        dash_profile_remove: 'Remove',
        dash_profile_delete_title: 'Remove Swimmer',
        dash_profile_delete_body1: 'You are about to remove',
        dash_profile_delete_body2: 'from your family registration.',
        dash_profile_delete_warning: 'This swimmer will be marked as inactive. Contact a coach if you need to restore this record.',
        dash_profile_delete_cancel: 'Cancel',
        dash_profile_delete_confirm: 'Delete',
        dash_profile_save_failed: 'Failed. Please try again.',
        dash_profile_swimmer_required: 'First name and last name are required.',
        dash_profile_swimmer_add_failed: 'Failed to add swimmer. Please try again.',

        // Account Security
        dash_profile_security_title: 'Account Security',
        dash_profile_current_password: 'Current Password',
        dash_profile_new_password: 'New Password',
        dash_profile_confirm_password: 'Confirm New Password',
        dash_profile_password_btn: 'Update Password',
        dash_profile_password_success: 'Password updated successfully!',
        dash_profile_password_mismatch: 'New passwords do not match.',
        dash_profile_password_wrong: 'Current password is incorrect.',
        dash_profile_password_error: 'Failed to update password.',

        // ── Dashboard — Swim Meets ──
        dash_meets_upcoming: 'Upcoming Meets',
        dash_meets_add: '+ Add Meet',
        dash_meets_new_title: 'New Swim Meet',
        dash_meets_edit_title: 'Edit Swim Meet',
        dash_meets_name_placeholder: 'Meet Name',
        dash_meets_start_date_placeholder: 'Start Date',
        dash_meets_end_date_placeholder: 'End Date',
        dash_meets_location_placeholder: 'Location',
        dash_meets_save: 'Save Meet',
        dash_meets_update: 'Update Meet',
        dash_meets_cancel: 'Cancel',
        dash_meets_delete: 'Delete',
        dash_meets_edit: 'Edit',
        dash_meets_register: 'Register',
        dash_meets_no_meets: 'No meets scheduled yet.',
        dash_meets_confirm_delete: 'Are you sure you want to delete this meet?',
        dash_meets_name_date_required: 'Please provide a name, start date, and end date.',

        // ── Dashboard — Schedule ──
        dash_schedule_weekly: 'Weekly Schedule',
        dash_schedule_add: '+ Add Session',
        dash_schedule_new_title: 'New Practice Session',
        dash_schedule_edit_title: 'Edit Practice Session',
        dash_schedule_start_time_placeholder: 'Start Time (e.g. 5:00 AM)',
        dash_schedule_end_time_placeholder: 'End Time (e.g. 7:00 AM)',
        dash_schedule_location_placeholder: 'Location (e.g. Pool A)',
        dash_schedule_save: 'Save Session',
        dash_schedule_update: 'Update Session',
        dash_schedule_cancel: 'Cancel',
        dash_schedule_no_practice: 'No practice',
        dash_schedule_delete_confirm: 'Are you sure you want to delete this session?',
        dash_schedule_required_fields: 'Please provide day, start time, and end time.',

        // ── Dashboard — Schedule CSV Import ──
        dash_schedule_import_csv: 'Import CSV',
        dash_csv_import_title: 'Import Practice Schedule from CSV',
        dash_csv_import_file: 'File',
        dash_csv_import_summary: '{valid} valid session(s), {error} error(s)',
        dash_csv_import_errors: 'Errors',
        dash_csv_import_row: 'Row',
        dash_csv_import_no_valid: 'No valid sessions found. Please correct the errors and try again.',
        dash_csv_import_confirm: 'Import {count} Session(s)',
        dash_csv_import_cancel: 'Cancel',
        dash_csv_import_success: 'Successfully imported {count} practice session(s).',

        // Preview table headers
        dash_csv_header_day: 'Day',
        dash_csv_header_start: 'Start Time',
        dash_csv_header_end: 'End Time',
        dash_csv_header_location: 'Location',

        // Validation errors
        dash_csv_error_bad_header: 'CSV file must start with a header row: Day, StartTime, EndTime, Location.',
        dash_csv_error_empty: 'CSV file is empty.',
        dash_csv_error_too_few_cols: 'Too few columns (expected: Day, StartTime, EndTime, Location).',
        dash_csv_error_missing_day: 'Day is missing.',
        dash_csv_error_invalid_day: 'Invalid day: "{day}". Use Monday through Sunday.',
        dash_csv_error_missing_start: 'Start time is missing.',
        dash_csv_error_missing_end: 'End time is missing.',
        dash_csv_error_invalid_time: 'Invalid {field}: "{value}". Expected format like "5:00 AM" or "17:00".',
        dash_csv_error_too_large: 'File is too large. Please use files under 500 KB.',
        dash_csv_error_not_csv: 'Please select a .csv file.',

        // Firestore errors
        dash_csv_error_permission: 'Permission denied. Only coaches can import schedules.',
        dash_csv_error_network: 'Network error. Please check your connection and try again.',
        dash_csv_error_unknown: 'Failed to import CSV.',

        // ── Dashboard — Days ──
        dash_day_sunday: 'Sunday',
        dash_day_monday: 'Monday',
        dash_day_tuesday: 'Tuesday',
        dash_day_wednesday: 'Wednesday',
        dash_day_thursday: 'Thursday',
        dash_day_friday: 'Friday',
        dash_day_saturday: 'Saturday',
    },
};

let currentLocale = 'en';

/**
 * Get a translated string by key.
 * @param {string} key - Translation key
 * @returns {string} Translated text
 */
export function t(key, params) {
    let value = translations[currentLocale]?.[key] ?? key;
    if (params) {
        Object.keys(params).forEach(k => {
            value = value.replace(new RegExp(`\\{${k}\\}`, 'g'), params[k]);
        });
    }
    return value;
}

/**
 * Set the active locale.
 * @param {string} locale - Locale code (e.g. 'en', 'es', 'zh')
 */
export function setLocale(locale) {
    if (translations[locale]) {
        currentLocale = locale;
    }
}

/**
 * Get the current locale.
 * @returns {string} Current locale code
 */
export function getLocale() {
    return currentLocale;
}
