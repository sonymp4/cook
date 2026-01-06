# 🚀 Quick Start Guide

## To Fix Empty Explore Page:

### Step 1: Make sure backend is running
```bash
cd backend
npm run dev
```

You should see:
- ✅ MongoDB connected
- 🚀 Server running on port 5000

### Step 2: Seed the database with recipes
```bash
# In the backend folder
npm run seed
```

This will add:
- 25+ ingredients
- 20+ world cuisine recipes including:
  - Italian Spaghetti Carbonara 🇮🇹
  - Mexican Beef Tacos 🇲🇽
  - Japanese Teriyaki Chicken 🇯🇵
  - Indian Chicken Curry 🇮🇳
  - French Ratatouille 🇫🇷
  - Thai Pad Thai 🇹🇭
  - Spanish Paella 🇪🇸
  - Chinese Peking Duck 🇨🇳
  - Brazilian Feijoada 🇧🇷
  - Greek Moussaka 🇬🇷
  - Vietnamese Pho 🇻🇳
  - Indonesian Beef Rendang 🇮🇩
  - British Shepherd's Pie 🇬🇧
  - Moroccan Tagine 🇲🇦
  - And more!

### Step 3: Refresh the explore page
- Pull down to refresh
- Or tap the refresh button if shown

### Step 4: Check your IP address
Make sure `cooking/utils/getApiUrl.ts` has your correct IP address!

## Troubleshooting

**Still seeing "No Recipes Available"?**

1. ✅ Check backend console - is it running?
2. ✅ Check MongoDB connection - see "✅ MongoDB connected"?
3. ✅ Run seed script - see "✅ Inserted X recipes"?
4. ✅ Check IP address in `utils/getApiUrl.ts`
5. ✅ Test in browser: `http://YOUR_IP:5000/api/recipes`

If all else fails, restart everything:
```bash
# Stop backend (Ctrl+C)
# Restart backend
cd backend
npm run dev

# In another terminal, seed database
cd backend
npm run seed
```





