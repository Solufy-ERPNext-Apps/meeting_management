// frappe.pages['meeting-generator'].on_page_load = function(wrapper) {

//     const page = frappe.ui.make_app_page({
//         parent: wrapper,
//         title: 'Meeting Generator',
//         single_column: true
//     });

//     $(page.body).html(`

//         <div class="meeting-wrapper">

//             <div class="top-header">

//                 <div>
//                     <h2 class="main-title">Meeting Scheduler</h2>

//                     <div class="sub-text">
//                         Generate meetings with guests
//                     </div>
//                 </div>

//                 <button class="btn btn-primary btn-lg" id="generate_meeting_btn">
//                     Generate Meeting
//                 </button>

//             </div>

//             <div class="filter-card">

//                 <div class="row">

//                     <div class="col-md-4">
//                         <div id="user_field"></div>
//                     </div>

//                     <div class="col-md-4">
//                         <div id="date_field"></div>
//                     </div>

//                     <div class="col-md-4">
//                         <div id="time_slot_field"></div>
//                     </div>

//                 </div>

//             </div>

//             <div class="table-card">

//                 <div class="table-title">
//                     Selected Guests
//                 </div>

//                 <table class="table table-bordered custom-table">

//                     <thead>
//                         <tr>
//                             <th>User</th>
//                             <th>Time Slot</th>
//                             <th width="120px">Action</th>
//                         </tr>
//                     </thead>

//                     <tbody id="selected_users_body">

//                         <tr>
//                             <td colspan="3" class="text-center text-muted">
//                                 No Guests Added
//                             </td>
//                         </tr>

//                     </tbody>

//                 </table>

//             </div>

//         </div>

//     `);

//     // STYLES
//     $(page.body).append(`

//         <style>

//             .meeting-wrapper {
//                 padding: 24px;
//                 background: #f5f7fb;
//                 min-height: 100vh;
//             }

//             .top-header {
//                 display: flex;
//                 justify-content: space-between;
//                 align-items: center;
//                 margin-bottom: 25px;
//             }

//             .main-title {
//                 font-size: 30px;
//                 font-weight: 700;
//                 margin-bottom: 5px;
//             }

//             .sub-text {
//                 color: #6b7280;
//                 font-size: 14px;
//             }

//             .filter-card,
//             .table-card {
//                 background: white;
//                 padding: 22px;
//                 border-radius: 14px;
//                 margin-bottom: 25px;
//                 box-shadow: 0 2px 10px rgba(0,0,0,0.05);
//             }

//             .table-title {
//                 font-size: 18px;
//                 font-weight: 600;
//                 margin-bottom: 15px;
//             }

//             .custom-table {
//                 margin-bottom: 0;
//             }

//             .custom-table thead {
//                 background: #f8fafc;
//             }

//             .custom-table td,
//             .custom-table th {
//                 vertical-align: middle !important;
//             }

//             .btn-lg {
//                 padding: 10px 18px;
//                 font-size: 14px;
//                 font-weight: 600;
//                 border-radius: 8px;
//             }

//             .form-group {
//                 margin-bottom: 0 !important;
//             }

//         </style>

//     `);

//     let selected_users = [];

//     // USER FIELD
//     let user_field = frappe.ui.form.make_control({
//         parent: $("#user_field"),
//         df: {
//             label: "Guest User",
//             fieldname: "guest_user",
//             fieldtype: "Link",
//             options: "User",
//             reqd: 1,
//             get_query: function() {
//                 return {
//                     query: "meeting_management.meeting_management.page.meeting_generator.meeting_generator.get_available_users_query"
//                 };
//             }
//         },
//         render_input: true
//     });

//     // DATE FIELD
//     let date_field = frappe.ui.form.make_control({
//         parent: $("#date_field"),
//         df: {
//             label: "Meeting Date",
//             fieldname: "meeting_date",
//             fieldtype: "Date",
//             reqd: 1,
//             default: frappe.datetime.get_today()
//         },
//         render_input: true
//     });

//     // SLOT FIELD
//     let slot_field = frappe.ui.form.make_control({
//         parent: $("#time_slot_field"),
//         df: {
//             label: "Preferred Time Slot",
//             fieldname: "time_slot",
//             fieldtype: "Select",
//             reqd: 1,
//             options: `
// 9 AM - 10 AM
// 10 AM - 11 AM
// 11 AM - 12 PM
// 12 PM - 1 PM
// 1 PM - 2 PM
// 2 PM - 3 PM
// 3 PM - 4 PM
// 4 PM - 5 PM
// 5 PM - 6 PM
//             `
//         },
//         render_input: true
//     });

//     user_field.refresh();
//     date_field.refresh();
//     slot_field.refresh();

//     // AUTO ADD USER
//     function add_user_to_table() {

//         let user = user_field.get_value();
//         let slot = slot_field.get_value();

//         if (!user || !slot) return;

//         let exists = selected_users.find(d => d.user === user);

//         if (exists) {
//             return;
//         }

//         selected_users.push({
//             user: user,
//             slot: slot
//         });

//         render_selected_users();

//         user_field.set_value("");
//     }

//     user_field.$input.on("change", function() {

//         setTimeout(() => {
//             add_user_to_table();
//         }, 300);

//     });

//     slot_field.$input.on("change", function() {

//         let user = user_field.get_value();

//         if (user) {
//             add_user_to_table();
//         }
//     });

//     // RENDER TABLE
//     function render_selected_users() {

//         let html = "";

//         if (!selected_users.length) {

//             html = `
//                 <tr>
//                     <td colspan="3" class="text-center text-muted">
//                         No Guests Added
//                     </td>
//                 </tr>
//             `;

//         } else {

//             selected_users.forEach((row, index) => {

//                 html += `
//                     <tr>

//                         <td>${row.user}</td>

//                         <td>${row.slot}</td>

//                         <td>
//                             <button
//                                 class="btn btn-danger btn-sm remove-user-btn"
//                                 data-index="${index}">
//                                 Remove
//                             </button>
//                         </td>

//                     </tr>
//                 `;
//             });
//         }

//         $("#selected_users_body").html(html);
//     }

//     // REMOVE USER
//     $(document).on("click", ".remove-user-btn", function() {

//         let index = $(this).attr("data-index");

//         selected_users.splice(index, 1);

//         render_selected_users();
//     });

//     // GENERATE MEETING
//     $("#generate_meeting_btn").click(function() {

//         let selected_date = date_field.get_value();
//         let selected_slot = slot_field.get_value();

//         if (!selected_date) {
//             frappe.msgprint("Please select Meeting Date");
//             return;
//         }

//         if (!selected_slot) {
//             frappe.msgprint("Please select a Preferred Time Slot before generating.");
//             return;
//         }

//         // 1. Convert slot string (e.g., "9 AM - 10 AM") to Frappe's expected time format ("09:00:00")
//         let start_time_str = selected_slot.split(" - ")[0]; // Extracts "9 AM"
//         let time_parts = start_time_str.match(/(\d+)\s*(AM|PM)/i);
//         let formatted_time = "";

//         if (time_parts) {
//             let hours = parseInt(time_parts[1], 10);
//             let ampm = time_parts[2].toUpperCase();

//             // Convert to 24-hour format
//             if (ampm === "PM" && hours < 12) hours += 12;
//             if (ampm === "AM" && hours === 12) hours = 0;

//             // Pad with leading zero if needed and append minutes/seconds
//             formatted_time = hours.toString().padStart(2, '0') + ":00:00";
//         }

//         let current_name = frappe.session.user_fullname;
//         let current_email = frappe.session.user;

//         // GUEST IDS
//         let guests = [];

//         selected_users.forEach(row => {
//             if (row.user) {
//                 guests.push(row.user);
//             }
//         });

//         // FINAL URL - Appended &time parameter
//         let meeting_url =
//             "https://dev-naman.nirankari.org/schedule/in/ishan" +
//             "?type=27i4bouF7p" +
//             `&date=${selected_date}` +
//             `&time=${formatted_time}` + 
//             `&name=${encodeURIComponent(current_name)}` +
//             `&email=${encodeURIComponent(current_email)}` +
//             `&guests=${encodeURIComponent(guests.join(","))}`;

//         window.open(meeting_url, "_blank");
//     });
// };

// meeting_management/meeting_management/page/meeting_generator/meeting_generator.js

frappe.pages['meeting-generator'].on_page_load = function(wrapper) {

    const page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Meeting Generator',
        single_column: true
    });

    // Main UI Template
    $(page.body).html(`
        <div class="meeting-wrapper">
            <div class="top-header">
                <div>
                    <h2 class="main-title">Meeting Scheduler</h2>
                    <div class="sub-text">Generate meetings with guests for ${frappe.session.user_fullname}</div>
                </div>
                <button class="btn btn-primary btn-lg" id="generate_meeting_btn">
                    Generate Meeting
                </button>
            </div>

            <div class="filter-card">
                <div class="row">
                    <div class="col-md-4">
                        <div id="user_field"></div>
                    </div>
                    <div class="col-md-4">
                        <div id="date_field"></div>
                    </div>
                    <div class="col-md-4">
                        <div id="time_slot_field"></div>
                    </div>
                </div>
            </div>

            <div class="table-card">
                <div class="table-title">Selected Guests</div>
                <table class="table table-bordered custom-table">
                    <thead>
                        <tr>
                            <th>User Email</th>
                            <th>Preferred Slot</th>
                            <th width="120px">Action</th>
                        </tr>
                    </thead>
                    <tbody id="selected_users_body">
                        <tr>
                            <td colspan="3" class="text-center text-muted">No Guests Added</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `);

    // CSS Styling
    $(page.body).append(`
        <style>
            .meeting-wrapper { padding: 24px; background: #f5f7fb; min-height: 100vh; }
            .top-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
            .main-title { font-size: 30px; font-weight: 700; margin-bottom: 5px; }
            .sub-text { color: #6b7280; font-size: 14px; }
            .filter-card, .table-card { background: white; padding: 22px; border-radius: 14px; margin-bottom: 25px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
            .table-title { font-size: 18px; font-weight: 600; margin-bottom: 15px; }
            .custom-table thead { background: #f8fafc; }
            .custom-table td, .custom-table th { vertical-align: middle !important; }
            .btn-lg { padding: 10px 18px; font-size: 14px; font-weight: 600; border-radius: 8px; }
        </style>
    `);

    let selected_users = [];
    let scheduler_data = null;

    // 1. GUEST USER FIELD
    let user_field = frappe.ui.form.make_control({
        parent: $("#user_field"),
        df: {
            label: "Add Guest",
            fieldname: "guest_user",
            fieldtype: "Link",
            options: "User",
            get_query: function() {
                return {
                    filters: { "name": ["!=", frappe.session.user] }
                };
            }
        },
        render_input: true
    });

    // 2. DATE FIELD
    let date_field = frappe.ui.form.make_control({
        parent: $("#date_field"),
        df: {
            label: "Meeting Date",
            fieldname: "meeting_date",
            fieldtype: "Date",
            default: frappe.datetime.get_today()
        },
        render_input: true
    });

    // 3. TIME SLOT FIELD (Fetching availability for current session user)
    let slot_field = frappe.ui.form.make_control({
        parent: $("#time_slot_field"),
        df: {
            label: "Your Available Slots",
            fieldname: "time_slot",
            fieldtype: "Select",
            options: ["Loading..."]
        },
        render_input: true
    });

    // Initialization: Fetch current user's availability and scheduler link
    function initialize_scheduler() {
        frappe.call({
            method: "meeting_management.meeting_management.page.meeting_generator.meeting_generator.get_schedular_link",
            args: { user: frappe.session.user },
            callback: function(r) {
                if (r.message && !r.message.error) {
                    scheduler_data = r.message;
                    
                    // Update slot field options from available_durations
                    let slot_options = r.message.available_durations.map(d => d.label);
                    slot_field.df.options = slot_options.join('\n');
                    slot_field.refresh();
                } else {
                    frappe.msgprint(__("Could not find appointment availability for your account."));
                }
            }
        });
    }

    initialize_scheduler();

    // AUTO ADD GUEST TO TABLE
    function add_guest_to_table() {
        let user = user_field.get_value();
        let slot = slot_field.get_value();

        if (!user || !slot) return;

        if (selected_users.find(d => d.user === user)) {
            user_field.set_value("");
            return;
        }

        selected_users.push({ user: user, slot: slot });
        render_selected_users();
        user_field.set_value("");
    }

    user_field.$input.on("change", () => setTimeout(add_guest_to_table, 300));

    function render_selected_users() {
        let html = "";
        if (!selected_users.length) {
            html = `<tr><td colspan="3" class="text-center text-muted">No Guests Added</td></tr>`;
        } else {
            selected_users.forEach((row, index) => {
                html += `
                    <tr>
                        <td>${row.user}</td>
                        <td>${row.slot}</td>
                        <td><button class="btn btn-danger btn-sm remove-user-btn" data-index="${index}">Remove</button></td>
                    </tr>`;
            });
        }
        $("#selected_users_body").html(html);
    }

    $(document).on("click", ".remove-user-btn", function() {
        selected_users.splice($(this).attr("data-index"), 1);
        render_selected_users();
    });

    // GENERATE MEETING LOGIC
    $("#generate_meeting_btn").click(function() {
        let selected_date = date_field.get_value();
        let selected_slot_label = slot_field.get_value();

        if (!selected_date || !scheduler_data) {
            frappe.msgprint("Please ensure date is selected and scheduler is loaded.");
            return;
        }

        // Find the specific duration object to get the 'type' (ID) and specific URL
        let duration_obj = scheduler_data.available_durations.find(d => d.label === selected_slot_label);
        
        if (!duration_obj) {
            frappe.msgprint("Please select a valid Time Slot.");
            return;
        }

        let guests = selected_users.map(row => row.user).join(",");

        // Construct dynamic URL
        let final_url = duration_obj.url + 
            `&date=${selected_date}` +
            `&name=${encodeURIComponent(frappe.session.user_fullname)}` +
            `&email=${encodeURIComponent(frappe.session.user)}` +
            `&guests=${encodeURIComponent(guests)}`;

        window.open(final_url, "_blank");
    });
};