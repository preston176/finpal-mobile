import wallet from "@/app/(tabs)/wallet";
import { firestore } from "@/config/firebase";
import { ResponseType, TransactionType, WalletType } from "@/types";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "@firebase/firestore";
import { uploadFileToCloudinary } from "./imageService";
import { createOrUpdateWallet } from "./walletService";
import { transactionTypes } from "@/constants/data";

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

    if (id) {
      const oldTransactionSnapshot = await getDoc(
        doc(firestore, "trasactions", id)
      );
      const oldTransaction = oldTransactionSnapshot.data() as TransactionType;
      const shouldRevertOriginal =
        oldTransaction.type != type ||
        oldTransaction.amount != amount ||
        oldTransaction.walletId != walletId;

      if (shouldRevertOriginal) {
        let res = await reverAndUpdateWallets(
          oldTransaction,
          Number(amount),
          type,
          walletId
        );
        if (!res.success) return res;
      }
    } else {
      // New transaction, update wallet balance
      let res = await updateWalletForNewTransaction(
        walletId!,
        Number(amount!),
        type
      );
      if (!res.success) return res;
    }

    if (image) {
      const imageUploadRes = await uploadFileToCloudinary(
        image,
        "transactions"
      );
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

const reverAndUpdateWallets = async (
  oldTransaction: TransactionType,
  newTransactionAmount: number,
  newTransactionType: string,
  newWalletId: string
): Promise<ResponseType> => {
  try {
    const originalWalletSnapshot = await getDoc(
      doc(firestore, "wallets", oldTransaction.walletId)
    );

    const originalWallet = originalWalletSnapshot.data() as WalletType;

    let newWalletSnapshot = await getDoc(
      doc(firestore, "wallets", newWalletId)
    );

    let newWallet = newWalletSnapshot.data() as WalletType;

    const revertType =
      oldTransaction.type == "income" ? "totalIncome" : "totalExpenses";

    const revertIncomeExpense: number =
      oldTransaction.type == "income"
        ? -Number(oldTransaction.amount)
        : Number(oldTransaction.amount);

    const revertedWalletAmount =
      Number(originalWallet.amount) + revertIncomeExpense;

    const revertedIncomeExpenseAmount =
      Number(originalWallet[revertType]) - Number(oldTransaction.amount);

    if (newTransactionType == "expense") {
      // if user tries to convert income to expense but insufficient balance

      if (
        oldTransaction.walletId == newWalletId &&
        revertedWalletAmount < newTransactionAmount
      ) {
        return {
          success: false,
          msg: "selected wallet don't have enough balance",
        };
      }
    }

    // if user tries to add expense

    if (newWallet.amount! < newTransactionAmount) {
      return {
        success: false,
        msg: "selected wallet don't have enough balance",
      };
    }

    await createOrUpdateWallet({
      id: oldTransaction.walletId,
      amount: revertedWalletAmount,
      [revertType]: revertedIncomeExpenseAmount,
    });

    newWalletSnapshot = await getDoc(doc(firestore, "wallets", newWalletId));

    const updateType =
      newTransactionType == "income" ? "totalIncome" : "totalExpenses";

    const updatedTransactionAmount: number =
      newTransactionType == "income"
        ? Number(newTransactionAmount)
        : -Number(newTransactionAmount);

    const newWalletAmount = Number(newWallet.amount) + updatedTransactionAmount;

    const newIncomeExpenseAmount = Number(
      newWallet[updateType]! + Number(newTransactionAmount)
    );

    await createOrUpdateWallet({
      id: newWalletId,
      amount: newWalletAmount,
      [updateType]: newIncomeExpenseAmount,
    });
    return { success: true };
  } catch (error: any) {
    console.log("Error creating or updating transaction", error);
    return { success: false, msg: error.message };
  }
};

export const deleteTransaction = async (
  transactionId: string,
  walletId: string
) => {
  try {
    const transacitonRef = doc(firestore, "transactions", transactionId);
    const transactionSnapshot = await getDoc(transacitonRef);

    if (!transactionSnapshot.exists()) {
      return { success: false, msg: "Transaction not found" };
    }
    const transactionData = transactionSnapshot.data() as TransactionType;

    const TransactionType = transactionData?.type;

    const transactionAmount = transactionData?.amount;

    const walletSnapshot = await getDoc(doc(firestore, "wallets", walletId));
    const walletData = walletSnapshot.data() as WalletType;

    const updateType =
      TransactionType == "income" ? "totalIncome" : "totalExpenses";
    const newWalletAmount =
      walletData?.amount! -
      (TransactionType == "income" ? transactionAmount : -transactionAmount);

    const newIncomeExpenseAmount = walletData[updateType]! - transactionAmount;

    if (TransactionType == "expense" && newWalletAmount < 0) {
      return { success: false, msg: "You cannot delete this transaction" };
    }

    await createOrUpdateWallet({
      id: walletId,
      amount: newWalletAmount,
      [updateType]: newIncomeExpenseAmount,
    });

    await deleteDoc(transacitonRef);

    return { success: true };
  } catch (err) {
    console.log("Error updating transaction", err);
    return { success: false, msg: err };
  }
};
