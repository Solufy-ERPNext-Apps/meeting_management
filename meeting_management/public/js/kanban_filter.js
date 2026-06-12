frappe.router.on('change', () => {

    setTimeout(() => {

        let route = frappe.get_route();

        // Only My Task Kanban
        if (
            route[0] === "List" &&
            route[1] === "SNM Task" &&
            route[2] === "Kanban" &&
            route[3] === "My Task"
        ) {

            let interval = setInterval(() => {

                // Wait until kanban fully loaded
                if (
                    cur_list &&
                    cur_list.filter_area
                ) {

                    clearInterval(interval);

                    let current_user = frappe.session.user;
                    console.log("Applying Kanban filter for user:", current_user);
                    // Clear old filters
                    cur_list.filter_area.clear(false);

                    // Add dynamic user filter
                    cur_list.filter_area.add([
                       [
							"SNM Task",
							"_assign",
							"like",
							"%" + current_user + "%"
						],
						[
							"SNM Task",
							"owner",
							"=",
							current_user
						]
                    ]);

                    // Refresh board
                    cur_list.refresh();

                }

            }, 500);

        }

    }, 300);

});
