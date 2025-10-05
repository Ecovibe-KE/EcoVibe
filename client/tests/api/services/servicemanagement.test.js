import api from "../../../src/api/axiosConfig";
import {
    addService,
    getServices,
    getServiceById,
    updateService,
    deleteService,
} from "../../../src/api/services/servicemanagement";

vi.mock("../../../src/api/axiosConfig"); // ✅ mock the axios instance

describe("Service Management API", () => {
    const mockData = { id: 1, title: "Test Service" };

    beforeEach(() => {
        vi.resetAllMocks();
    });

    // --- GET ALL SERVICES ---
    test("getServices() returns data on success", async () => {
        api.get.mockResolvedValueOnce({ data: { status: "success", data: [mockData] } });
        const result = await getServices();
        expect(result.data[0]).toEqual(mockData);
        expect(api.get).toHaveBeenCalledWith("/services");
    });

    test("getServices() throws on error", async () => {
        api.get.mockRejectedValueOnce(new Error("Network Error"));
        await expect(getServices()).rejects.toThrow("Network Error");
    });

    // --- GET BY ID ---
    test("getServiceById() fetches correct service", async () => {
        api.get.mockResolvedValueOnce({ data: mockData });
        const result = await getServiceById(1);
        expect(api.get).toHaveBeenCalledWith("/services/1");
        expect(result).toEqual(mockData);
    });

    // --- ADD SERVICE ---
    test("addService() posts new service and returns data", async () => {
        api.post.mockResolvedValueOnce({ data: { status: "success", data: mockData } });
        const result = await addService(mockData);
        expect(api.post).toHaveBeenCalledWith("/services", mockData);
        expect(result.data).toEqual(mockData);
    });

    // --- UPDATE SERVICE ---
    test("updateService() updates service successfully", async () => {
        api.put.mockResolvedValueOnce({ data: { status: "success", data: mockData } });
        const result = await updateService(1, mockData);
        expect(api.put).toHaveBeenCalledWith("/services/1", mockData);
        expect(result.data).toEqual(mockData);
    });

    // --- DELETE SERVICE ---
    test("deleteService() deletes service successfully", async () => {
        api.delete.mockResolvedValueOnce({ data: { status: "success", message: "Deleted" } });
        const result = await deleteService(1);
        expect(api.delete).toHaveBeenCalledWith("/services/1");
        expect(result.message).toBe("Deleted");
    });
});
