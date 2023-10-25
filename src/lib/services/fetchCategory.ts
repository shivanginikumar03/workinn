import { Category } from '@/interfaces/service';
import { db } from '@/utils/firebaseAdmin';

const fetchCategory = async (categoryId: string): Promise<APIResponse<Category>> => {
    const categoryRef = db.collection('categories').doc(categoryId);
    const categorySnapshot = await categoryRef.get();
    const category = categorySnapshot.data() as Category;

    return { data: category };
};

export default fetchCategory;
