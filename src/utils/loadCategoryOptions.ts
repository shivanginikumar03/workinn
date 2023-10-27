import debounce from "./debounce";
import { Category } from "@/interfaces/service";
import fetchCategoryOptions from "@/lib/services/category/fetchCategoriesOptions";

const promiseCategoryOptions = async (inputValue: string, callback: (res: Category[]) => void) => {
    try {
        const res = await fetchCategoryOptions(inputValue);
        callback(res);
    } catch (error) {
        // Todo: Handle error appropriately, e.g., log the error or show a user-friendly message
        console.error('Error fetching categories options:', error);
    }
};

const loadCategoryOptions = async (inputValue: string) => {
    try {
        return await new Promise<Category[]>((resolve) => {
            const debouncedPromise = debounce(async () => {
                await promiseCategoryOptions(inputValue, (res) => {
                    resolve(res);
                });
            }, 300);
            debouncedPromise();
        });
    } catch (error) {
        // Todo: Handle error appropriately, e.g., log the error or show a user-friendly message
        console.error('Error loading categories options:', error);
        return [];
    }
};

export default loadCategoryOptions;