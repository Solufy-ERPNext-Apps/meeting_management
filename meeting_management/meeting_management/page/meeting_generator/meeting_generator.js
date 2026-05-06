// meeting_management/meeting_management/page/meeting_generator/meeting_generator.js

frappe.pages['meeting-generator'].on_page_load = function(wrapper) {
    const page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Meeting Scheduler',
        single_column: true
    });

    $(page.body).html(`
        <div class="employee-card">
            <h3>Available Hosts</h3>
            <table class="employee-table">
                <thead>
                    <tr>
                        <th style="width: 80px;">Sr. No</th>
                        <th>User Name</th>
                        <th>Email ID</th>
                        <th style="text-align: center; width: 220px;">Action</th>
                    </tr>
                </thead>
                <tbody id="meeting_user_body">
                    <tr>
                        <td colspan="4" class="text-center" style="padding: 30px; color: #6b7280;">
                            Loading available hosts...
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `);

    // Styling with the requested green color and card layout
    $(page.body).append(`
        <style>
            .employee-card {
                background: #ffffff;
                padding: 30px;
                border-radius: 12px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                margin-top: 20px;
            }
            .employee-card h3 {
                margin-bottom: 20px;
                font-size: 18px;
                font-weight: 700;
                color: #1f2937;
            }
            .employee-table {
                width: 100%;
                border-collapse: collapse;
            }
            .employee-table th {
                background: #f5f6fa;
                padding: 12px;
                text-align: left;
                font-weight: 600;
                color: #4b5563;
                font-size: 13px;
                text-transform: uppercase;
            }
            .employee-table td {
                padding: 12px;
                border-top: 1px solid #eee;
                font-size: 14px;
                color: #374151;
                vertical-align: middle;
            }
            .employee-table tr:hover {
                background: #f9f9f9;
            }
            .user-link {
                color: #1f2937;
                font-weight: 600;
                text-decoration: none;
                cursor: pointer;
            }
            .user-link:hover {
                color: #28a745; /* Green hover */
                text-decoration: underline;
            }
            .btn-schedule-green {
                background-color: #28a745; /* Specific Green Color */
                color: white !important;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.2s;
            }
            .btn-schedule-green:hover {
                background-color: #218838;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
        </style>
    `);

    // Redirection function
    window.schedule_with_user = function(user_id) {
        frappe.call({
            method: "meeting_management.meeting_management.page.meeting_generator.meeting_generator.get_user_scheduler_url",
            args: { user: user_id },
            callback: function(r) {
                if (r.message) {
                    window.open(r.message, "_blank"); // Opens the specific user's link
                }
            }
        });
    };

    // Load users
    frappe.call({
        method: "meeting_management.meeting_management.page.meeting_generator.meeting_generator.get_simple_user_list",
        callback: function(r) {
            let html = "";
            if (r.message && r.message.length) {
                r.message.forEach((user, index) => {
                    html += `
                        <tr>
                            <td style="color: #6b7280;">${index + 1}</td>
                            <td>
                                <a class="user-link" onclick="schedule_with_user('${user.name}')">
                                    ${user.full_name || user.name}
                                </a>
                            </td>
                            <td style="color: #6b7280;">${user.name}</td>
                            <td style="text-align: center;">
                                <button class="btn-schedule-green" onclick="schedule_with_user('${user.name}')">
                                    Schedule Appointment
                                </button>
                            </td>
                        </tr>
                    `;
                });
            } else {
                html = '<tr><td colspan="4" class="text-center">No available hosts found.</td></tr>';
            }
            $("#meeting_user_body").html(html);
        }
    });
};