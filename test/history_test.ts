import cbHistory from "history";

describe("Screen", function () {

    it("should return the list of workspaces", function () {
        let screen = new Screen({
            n_workspaces: 2,
            get_workspace_by_index: function (index) {
                switch (index) {
                    case 0:
                        return 1;
                    case 1:
                        return 2;
                }
            }
        });

        // should return the two items defined in get_workspace_by_index
        expect(screen.getWorkspaces()).toEqual([1, 2]);
    });

    it("should return the active workspace", function () {
        let screen = new Screen({
            get_active_workspace: function () {
                return 5;
            }
        });

        // should return the item defined in get_active_workspace
        expect(screen.getActiveWorkspace()).toBe(5);
    });
});
