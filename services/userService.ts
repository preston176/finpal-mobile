import { firestore } from "@/config/firebase";
import { UserDataType, ResponseType } from "@/types";
import { doc, updateDoc } from "@firebase/firestore";

export const updateUser = async (
  uid: string,
  updatedData: UserDataType
): Promise<ResponseType> => {
  try {
    //Todo: Image upload pending

    const userRef = doc(firestore, "users", uid);
    await updateDoc(userRef, updatedData);

    // fetch user and update data
    return { success: true, msg: "updated successfully" };
  } catch (error: any) {
    console.log("Error updating user data", error);
    return { success: false, msg: error?.message };
  }
};
