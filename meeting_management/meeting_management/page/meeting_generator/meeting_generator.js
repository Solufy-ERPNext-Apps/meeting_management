// meeting_management/meeting_management/page/meeting_generator/meeting_generator.js

frappe.pages['meeting-generator'].on_page_load = function(wrapper) {
    const page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Meeting Scheduler',
        single_column: true
    });

    // Clean table structure
    $(page.body).html(`
        <div class="scheduler-page">
            <div class="card-container">
                <table class="table host-table">
                    <thead>
                        <tr>
                            <th>Available User</th>
                            <th class="text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody id="host_list_body">
                        <tr><td colspan="2" class="text-center">Finding hosts...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `);

    // Modern styling for the "just mention" look
    $(page.body).append(`
        <style>
            .scheduler-page { padding: 40px; background: #f9fafb; min-height: 100vh; }
            .card-container { background: white; border-radius: 10px; border: 1px solid #eaebed; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .host-table thead { background: #f3f4f6; }
            .host-table th { padding: 12px 20px; color: #4b5563; font-size: 11px; text-transform: uppercase; border: none; }
            .host-table td { padding: 16px 20px; vertical-align: middle; border-top: 1px solid #f3f4f6; }
            .host-name { font-weight: 600; color: #111827; font-size: 15px; }
            .host-email { color: #6b7280; font-size: 13px; }
            .btn-book { background: #2563eb; color: white; border: none; padding: 7px 16px; border-radius: 6px; font-weight: 500; cursor: pointer; }
            .btn-book:hover { background: #1d4ed8; }
            .text-right { text-align: right; }
        </style>
    `);

    // Function to handle the click
    window.schedule_with_user = function(user_id) {
        frappe.call({
            method: "meeting_management.meeting_management.page.meeting_generator.meeting_generator.get_user_scheduler_url",
            args: { user: user_id },
            callback: function(r) {
                if (r.message) window.open(r.message, "_blank");
            }
        });
    };

    // Load the users directly
    frappe.call({
        method: "meeting_management.meeting_management.page.meeting_generator.meeting_generator.get_simple_user_list",
        callback: function(r) {
            let html = "";
            if (r.message && r.message.length) {
                r.message.forEach(u => {
                    html += `
                        <tr>
                            <td>
                                <div class="host-name">${u.full_name}</div>
                                <div class="host-email">${u.name}</div>
                            </td>
                            <td class="text-right">
                                <button class="btn-book" onclick="schedule_with_user('${u.name}')">
                                    Schedule Appointment
                                </button>
                            </td>
                        </tr>
                    `;
                });
            } else {
                html = `<tr><td colspan="2" class="text-center">No hosts available right now.</td></tr>`;
            }
            $("#host_list_body").html(html);
        }
    });
};