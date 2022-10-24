import axios from "axios";
import { apiGet } from "./azureApiUtils";
import { createTestPlan } from "./testPlan";
jest.mock("axios");

const mockAxios = axios;
mockAxios.create = jest.fn(() => mockAxios);

beforeEach(() => {
  jest.restoreAllMocks();
});

describe("azureApiUtils", () => {
  describe("apiGet", () => {
    test("should call axios with provided string", () => {
      mockAxios.get.mockResolvedValue({ data: {} });

      const myString = "some string";

      const baseTestPlan = createTestPlan({
        organisation: "",
        pat: "",
        planId: "",
        project: "",
        runName: "",
      });

      apiGet(baseTestPlan, myString);

      expect(mockAxios.get).toHaveBeenCalledWith(myString);
    });

    test("should return `data.value` property from response", async () => {
      const returnValue = "myReturnValue";
      mockAxios.get.mockResolvedValue({ data: { value: returnValue } });

      const myString = "some string";

      const baseTestPlan = createTestPlan({
        organisation: "",
        pat: "",
        planId: "",
        project: "",
        runName: "",
      });

      const response = await apiGet(baseTestPlan, myString);

      expect(response).toBe(returnValue);
    });
  });
});
