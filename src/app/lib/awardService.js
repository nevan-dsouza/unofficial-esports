import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

const db = getFirestore();
const storage = getStorage();

export const addAward = async (awardId, name, imagePath, category, description) => {
  const imageRef = ref(storage, imagePath);
  const imageURL = await getDownloadURL(imageRef);

  await setDoc(doc(db, 'awards', awardId), {
    name,
    imageURL,
    category,
    description,
  });
};

export const assignAwardToUser = async (userId, awardId) => {
  const userAwardRef = doc(db, 'users', userId, 'awards', awardId);

  await setDoc(userAwardRef, {
    awardId,
    earnedDate: Timestamp.fromDate(new Date()),
    favorite: false,
  });
};
