import { getStorage, ref, getDownloadURL } from "firebase/storage";

const storage = getStorage();

export const getDefaultUrls = async () => {
  try {
    const defaultAvatarURL = await getDownloadURL(ref(storage, 'default/default-avatar.png'));
    const defaultPlayerCardURL = await getDownloadURL(ref(storage, 'default/default-player-card.png'));
    const defaultTournamentURL = await getDownloadURL(ref(storage, 'default/default-tournament.png'));

    return {
      defaultAvatarURL,
      defaultPlayerCardURL,
      defaultTournamentURL
    };
  } catch (error) {
    console.error('Error fetching default URLs:', error);
    return {
      defaultAvatarURL: '/default/default-avatar.png', // fallback URL
      defaultPlayerCardURL: '/default/default-player-card.png', // fallback URL
      defaultTournamentURL: '/default/default-tournament.png'
    };
  }
};
