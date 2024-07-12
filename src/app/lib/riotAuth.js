import axios from 'axios';

const RIOT_API_URL = 'https://api.riotgames.com';

export const getRiotUserInfo = async (accessToken) => {
  const response = await axios.get(`${RIOT_API_URL}/lol/summoner/v4/summoners/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};
