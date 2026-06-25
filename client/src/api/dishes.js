import axios from 'axios';
import { API_BASE_URL } from '../config';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

export async function fetchDishes() {
  const res = await api.get('/dishes');
  return res.data.data;
}

export async function toggleDishPublished(dishId) {
  const res = await api.patch(`/dishes/${dishId}/toggle`);
  return res.data.data;
}
