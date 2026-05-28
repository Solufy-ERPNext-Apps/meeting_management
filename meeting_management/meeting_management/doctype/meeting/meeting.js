// Copyright (c) 2023, FinByz Tech Pvt. Ltd. and contributors
// For license information, please see license.txt

var calculate_total_expense = function(frm) {
    var total_expense = flt(frm.doc.local_travel_expense) + flt(frm.doc.train_tickets) + flt(frm.doc.flight_ticket) + flt(frm.doc.food_expense)+flt(frm.doc.lodging_cost);
    frm.set_value("total_expense", total_expense);
};
frappe.ui.form.on("Meeting", "local_travel_expense", function(frm) {
    calculate_total_expense(frm);
});
frappe.ui.form.on("Meeting", "train_tickets", function(frm) {
    calculate_total_expense(frm);
});
frappe.ui.form.on("Meeting", "flight_ticket", function(frm) {
    calculate_total_expense(frm);
});
frappe.ui.form.on("Meeting", "food_expense", function(frm) {
    calculate_total_expense(frm);
});
frappe.ui.form.on("Meeting", "lodging_cost", function(frm) {
    calculate_total_expense(frm);
});

frappe.ui.form.on('Meeting', {

	send_mail: function(frm){
		if (frm.is_dirty()){
			frappe.throw("Please Save the Current Document and Then Proceed again")
		}
		else{
			frappe.call({
				method:"meeting_management.meeting_management.doctype.meeting.meeting.send_mail",
				args:{
					self : frm.doc
				},
			})
		}
	},
	onload: function(frm) {
		disable_add_and_delete_row(frm);
	},
	refresh: function(frm) {
		frm.fields_dict.contact_person.get_query = function(doc) {
			return {
				query: 'frappe.contacts.doctype.contact.contact.contact_query',
				filters: {
					link_doctype: frm.doc.party_type,
					link_name: frm.doc.party
				}
			}
		};
		frm.fields_dict.meeting_party_representative.grid.get_field("contact").get_query = function(doc,cdt,cdn) {
			return {
				query: 'frappe.contacts.doctype.contact.contact.contact_query',
				filters: {
					link_doctype: frm.doc.party_type,
					link_name: frm.doc.party
				}
			}
		}
		frm.fields_dict.address.get_query = function(doc) {
			return {
				query: 'frappe.contacts.doctype.address.address.address_query',
				filters: {
					link_doctype: frm.doc.party_type,
					link_name: frm.doc.party
				}
			}
		};
		if (!frm.doc.__islocal && frm.doc.docstatus === 1) {
	frm.add_custom_button(__("Create Task"), () => {

	frappe.new_doc("SNM Task", {
		meeting: frm.doc.name
	});
	}).css({
		"background-color": "black",
		"color": "#fff"
	});
	}
	if (!frm.is_new() && frm.doc.docstatus === 1) {
		frm.add_custom_button("Follow Up", () => {

	let d = new frappe.ui.Dialog({
		title: "Create Follow Up",
		fields: [
			{
				fieldname: "subject",
				label: "Subject",
				fieldtype: "Data",
				reqd: 1,
				default:frm.doc.meeting_title
			},
			{
				fieldname: "follow_up_date",
				label: "Start Date",
				fieldtype: "Datetime",
				reqd: 1
			},
			{
				fieldname: "follow_end_date",
				label: "End Date",
				fieldtype: "Datetime",
				reqd: 1
			},
			{
				fieldname: "description",
				label: "Description",
				fieldtype: "Small Text",
				default: frappe.utils.html2text(frm.doc.discussion || "")

			},
		],

		primary_action_label: "Create",

		primary_action(values) {

			frappe.call({
				method: "meeting_management.meeting_management.doctype.meeting.meeting.create_follow_up_meeting",
				args: {
					parent_meeting: frm.doc.name,
					subject: values.subject,
					description: values.description,
					follow_up_date: values.follow_up_date,
					follow_end_date:values.follow_end_date,
					contact_person: frm.doc.contact_person
				},
				callback: function(r) {

					if (r.message) {

						frappe.msgprint(__("Follow Up Meeting Created"));

						frappe.set_route("Form", "Meeting", r.message);
					}
				}
			});

			d.hide();
		}
	});

	d.show();

}).css({
	"background-color": "black",
	"color": "#fff"
});
			if(!frm.doc.meet_link && frm.doc.docstatus === 1){
				frm.add_custom_button("Create Google Meet", () => {

					frappe.call({
						method: "meeting_management.meeting_management.doctype.meeting.meeting.create_google_meet",
						args: {
							event_name: frm.doc.name
						},
						callback(r) {

							if (r.message) {
								console.log(r.message);
								frappe.msgprint(`
								<a href="${r.message.meet_link}" target="_blank">
									${r.message.meet_link}
								</a>
							`);
								frm.reload_doc();
							}
						}
					});

				});
			}
		}

	},
	meeting_from(frm) {
		if (frm.doc.meeting_from && !frm.doc.meeting_to){
		    // frm.set_value('scheduled_to',frm.doc.scheduled_from)
			frm.set_value('meeting_to',frappe.datetime.get_datetime_as_string(frappe.datetime.str_to_obj(frm.doc.meeting_from).setHours(frappe.datetime.str_to_obj(frm.doc.meeting_from).getHours() + 1)))
		}
	},
	validate: function(frm){
		if (frm.doc.party && frm.doc.party_type){
			frm.trigger('party')
		}
		frm.trigger('set_link_documents');
		// frm.trigger('calculate_km_wise_expense');
	},
	party: function(frm){
		// if(frm.doc.party_type == "Customer" && frm.doc.party)
		frappe.call({
			method:"meeting_management.meeting_management.doctype.meeting_schedule.meeting_schedule.get_party_details",
			args:{
				party: frm.doc.party,
				party_type: frm.doc.party_type
			},
			callback: function(r){
				if(r.message){
					frm.set_value('contact_person', r.message.contact_person)
					frm.set_value('email_id', r.message.contact_email)
					frm.set_value('mobile_no', r.message.contact_mobile)
					frm.set_value('contact', r.message.contact_dispaly)
					frm.set_value('address', r.message.customer_address)
					frm.set_value('address_display', r.message.address_display)
					frm.set_value('organization', r.message.organisation);
				}
			}
		})
	},
	set_link_documents: function(frm){
		if(frm.doc.party){
			if(frm.doc.party_type=="Lead"){
				frm.set_value("lead",frm.doc.party)
			}
			else if(frm.doc.party_type=="Customer"){
				frm.set_value("customer",frm.doc.party)
			}
			else if(frm.doc.party_type=="Opportunity"){
				frm.set_value("opportunity",frm.doc.party)
			}
		}		
	},
	total_kms:function(frm){
		if ((frappe.meta.get_docfield("Meeting", "total_kms")) && (frappe.meta.get_docfield("Meeting", "rate_per_km"))){
			frm.set_value('local_travel_expense',flt(frm.doc.total_kms) * flt(frm.doc.rate_per_km))
		}		
	},
	rate_per_km: function(frm){
		if ((frappe.meta.get_docfield("Meeting", "total_kms")) && (frappe.meta.get_docfield("Meeting", "rate_per_km"))){
			frm.set_value('local_travel_expense',flt(frm.doc.total_kms) * flt(frm.doc.rate_per_km))
		}			
	},
	
});



function disable_add_and_delete_row(frm) {
  // Disable add/delete in recurring_meeting child table
  frm.set_df_property("recurring_meeting", "cannot_add_rows", true);
  frm.set_df_property("recurring_meeting", "cannot_delete_rows", true);
  frm.fields_dict["recurring_meeting"].grid.add_new_row = () => {};
  if (!frm.doc.recurring_meeting || frm.doc.recurring_meeting.length === 0) {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ];

    days.forEach((day) => {
      let row = frm.add_child("recurring_meeting");
      row.day = day;
    });
    frm.refresh_field("recurring_meeting");
  }
}