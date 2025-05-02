import wallet from "@/app/(tabs)/wallet";
import { firestore } from "@/config/firebase";
import { ResponseType, TransactionType, WalletType } from "@/types";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "@firebase/firestore";
import { uploadFileToCloudinary } from "./imageService";

// 🔥 Utility function to remove undefined fields
function removeUndefinedFields<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  ) as Partial<T>;
}

export const createOrUpdateTransaction = async (
  transactionData: Partial<TransactionType>
): Promise<ResponseType> => {
  try {
    const { id, type, walletId, amount, image } = transactionData;

    // Validate basic fields
    if (!amount || amount <= 0 || !walletId || !type) {
      return { success: false, msg: "Invalid transaction data" };
    }

    if (id) { const oldTransactionSnapshot = await getDoc(doc(firestore, "trasactions", id))
      const oldTransaction = oldTransactionSnapshot.data() as TransactionType
     
    } else {
 // New transaction, update wallet balance
 let res = await updateWalletForNewTransaction(walletId!, Number(amount!), type);
 if (!res.success) return res;
    }

    if (image) {
      const imageUploadRes = await uploadFileToCloudinary(image, "transactions");
      if (!imageUploadRes.success) {
        return {
          success: false,
          msg: imageUploadRes.msg || "Failed to upload receipt image",
        };
      }
      transactionData.image = imageUploadRes.data;
    }

    const transactionRef = id
      ? doc(firestore, "transactions", id)
      : doc(collection(firestore, "transactions"));

    // 🚀 Clean the transactionData to remove undefined fields
    const cleanedTransactionData = removeUndefinedFields(transactionData);

    await setDoc(transactionRef, cleanedTransactionData, { merge: true });

    return {
      success: true,
      data: { ...cleanedTransactionData, id: transactionRef.id },
    };
  } catch (error: any) {
    console.log("Error creating or updating transaction", error);
    return { success: false, msg: error.message };
  }
};

const updateWalletForNewTransaction = async (
  walletId: string,
  amount: number,
  type: string
): Promise<ResponseType> => {
  try {
    const walletRef = doc(firestore, "wallets", walletId);
    const walletSnapshot = await getDoc(walletRef);

    if (!walletSnapshot.exists()) {
      console.log("Error updating wallet for new transaction");
      return { success: false, msg: "Invalid transaction data" };
    }

    const walletData = walletSnapshot.data() as WalletType;

    if (type === "expense" && walletData.amount! - amount < 0) {
      return {
        success: false,
        msg: "Selected wallet doesn't have enough balance",
      };
    }

    const updateType = type === "income" ? "totalIncome" : "totalExpenses";
    const updatedWalletAmount =
      type === "income"
        ? Number(walletData.amount) + amount
        : Number(walletData.amount) - amount;

    const updatedTotals =
      type === "income"
        ? Number(walletData.totalIncome) + amount
        : Number(walletData.totalExpenses) + amount;

    await updateDoc(walletRef, {
      amount: updatedWalletAmount,
      [updateType]: updatedTotals,
    });

    return { success: true };
  } catch (error: any) {
    console.log("Error creating or updating transaction", error);
    return { success: false, msg: error.message };
  }
};
