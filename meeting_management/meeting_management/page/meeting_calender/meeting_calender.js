// frappe.pages['meeting-calender'].on_page_load = function(wrapper) {
// 	var page = frappe.ui.make_app_page({
// 		parent: wrapper,
// 		title: 'Meeting Calender',
// 		single_column: true
// 	});
// }
frappe.pages['meeting-calender'].on_page_load = function(wrapper) {

	const page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Meeting Calendar',
		single_column: true
	});

	// Hide frappe sidebar
	$(wrapper).find('.layout-side-section').hide();

	// Expand content
	$(wrapper).find('.layout-main-section-wrapper').css({
		"width": "100%",
		"padding-left": "0"
	});

	// Create container
	const calendar_area = $('<div id="calendar-area"></div>')
		.css({
			height: '85vh',
			background: 'white'
		})
		.appendTo(page.main);

	// Load Event Calendar route inside page
	frappe.set_route('List', 'Event', 'Calendar');
};