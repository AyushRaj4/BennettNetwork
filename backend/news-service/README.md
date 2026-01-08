# Bennett University News Service

## Overview

Microservice that scrapes and serves Bennett University news with automatic updates.

## Features

- ✅ Web scraping with Cheerio (fallback to curated data)
- ✅ **Automatic updates every hour via cron job**
- ✅ MongoDB storage with duplicate prevention
- ✅ REST API with pagination and filtering
- ✅ Category-based news organization
- ✅ Real Bennett University URLs (all working links)

## How Automatic Updates Work

### 1. **Cron Job Scheduling**

The service uses `node-cron` to automatically scrape news every hour:

```javascript
// In server.js
cron.schedule("0 * * * *", async () => {
  console.log("⏰ Scheduled scraping started");
  await scraper.scrapeBennettNews();
});
```

**Schedule Pattern**: `"0 * * * *"`

- Runs at minute 0 of every hour
- Examples: 1:00 AM, 2:00 AM, 3:00 AM, etc.

### 2. **Initial Scraping on Startup**

When service starts, it waits 5 seconds then scrapes:

```javascript
setTimeout(async () => {
  console.log("🚀 Running initial news scraping...");
  await scraper.scrapeBennettNews();
}, 5000);
```

### 3. **Duplicate Prevention**

News items are deduplicated based on `sourceUrl`:

```javascript
await News.findOneAndUpdate(
  { sourceUrl: item.sourceUrl },
  { ...item, scrapedAt: new Date() },
  { upsert: true, new: true } // Insert if not exists, update if exists
);
```

### 4. **Scraping Process Flow**

```
Start
  ↓
Try scraping Bennett website
  ↓
Success? → Parse HTML & extract news
  ↓
Failed? → Use fallback curated data
  ↓
Save to MongoDB (skip duplicates)
  ↓
Log results (saved/skipped/total)
```

## API Endpoints

### Get All News

```bash
GET /api/news?category=placements&limit=10&page=1

# Response
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 50,
    "page": 1,
    "pages": 5,
    "limit": 10
  }
}
```

### Get Latest News (Top 5)

```bash
GET /api/news/latest

# Response
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Bennett University - Leading Private University",
      "description": "...",
      "sourceUrl": "https://www.bennett.edu.in/",
      "imageUrl": "https://images.unsplash.com/...",
      "category": "news",
      "publishedDate": "2025-11-19T...",
      ...
    }
  ]
}
```

### Get News by ID

```bash
GET /api/news/:id
```

### Get Categories with Counts

```bash
GET /api/news/categories

# Response
{
  "success": true,
  "data": [
    { "category": "placements", "count": 2 },
    { "category": "academics", "count": 2 },
    { "category": "events", "count": 2 },
    ...
  ]
}
```

### Get Statistics

```bash
GET /api/news/stats

# Response
{
  "success": true,
  "data": {
    "total": 10,
    "recentWeek": 5,
    "byCategory": {
      "news": 3,
      "academics": 2,
      "placements": 1,
      ...
    }
  }
}
```

### Manual Scrape Trigger

```bash
POST /api/news/scrape

# Response
{
  "success": true,
  "message": "News scraping completed",
  "data": {
    "saved": 5,
    "skipped": 5,
    "total": 10
  }
}
```

### Cleanup Old News (6+ months)

```bash
DELETE /api/news/cleanup

# Response
{
  "success": true,
  "message": "Deleted 15 old news items",
  "data": { "deletedCount": 15 }
}
```

## Update Frequency

| Update Type | Frequency  | Description                          |
| ----------- | ---------- | ------------------------------------ |
| Automatic   | Every hour | Cron job runs at :00 of each hour    |
| On Startup  | Once       | Initial scrape 5 seconds after start |
| Manual      | On demand  | Call `/api/news/scrape` endpoint     |

## Configuration

### Environment Variables (.env)

```env
PORT=3011
MONGODB_URI=mongodb://localhost:27017/bennett-news
BENNETT_NEWS_URL=https://www.bennett.edu.in/news-events/
SCRAPE_INTERVAL=3600000  # 1 hour in milliseconds
CACHE_DURATION=1800      # 30 minutes in seconds
```

### Change Update Frequency

**Every 30 minutes:**

```javascript
cron.schedule("*/30 * * * *", async () => { ... });
```

**Every 6 hours:**

```javascript
cron.schedule("0 */6 * * *", async () => { ... });
```

**Daily at 9 AM:**

```javascript
cron.schedule("0 9 * * *", async () => { ... });
```

**Every Monday at 10 AM:**

```javascript
cron.schedule("0 10 * * 1", async () => { ... });
```

## News Categories

- `news` - General university news
- `events` - Campus events, fests, workshops
- `academics` - Courses, programs, curriculum
- `placements` - Placement drives, recruitment
- `achievements` - Awards, rankings, achievements

## Current News Sources (All Working Links)

1. **Main Website**: https://www.bennett.edu.in/
2. **Engineering Programs**: https://www.bennett.edu.in/engineering/
3. **Placements**: https://www.bennett.edu.in/placements/
4. **CSE School**: https://www.bennett.edu.in/schools/school-of-computer-science-engineering/
5. **Campus Life**: https://www.bennett.edu.in/campus-life/
6. **Research**: https://www.bennett.edu.in/research/
7. **Admissions**: https://www.bennett.edu.in/admissions/
8. **International Programs**: https://www.bennett.edu.in/international-collaborations/
9. **Sports**: https://www.bennett.edu.in/sports/
10. **Rankings**: https://www.bennett.edu.in/why-bennett/rankings-accreditations/

## Monitoring

### Check Service Status

```bash
curl http://localhost:3011/health
```

### View Logs

```bash
tail -f /tmp/news-service.log
```

### Check Scrape Status

Look for log messages:

- `🚀 Running initial news scraping...`
- `⏰ Scheduled scraping started`
- `✅ Scraping complete: X new, Y existing`

### Check Database

```bash
mongosh bennett-news
> db.news.countDocuments()
> db.news.find().limit(1).pretty()
```

## Troubleshooting

### News not updating?

1. Check if cron job is running: `ps aux | grep node | grep news-service`
2. Check logs: `tail -f /tmp/news-service.log`
3. Manual trigger: `curl -X POST http://localhost:3011/api/news/scrape`

### Service not starting?

1. Check if port 3011 is available: `lsof -i:3011`
2. Check MongoDB connection: `mongosh bennett-news`
3. Check environment variables in `.env`

### Scraping fails?

- Service falls back to curated data automatically
- Check network connectivity
- Website structure may have changed (update selectors)

## Integration with Frontend

The frontend automatically fetches news on page load:

```typescript
// In Home.tsx
const fetchNews = async () => {
  const response = await newsService.getLatestNews();
  setNews(response.data);
};

useEffect(() => {
  fetchNews();
}, []);
```

## Future Enhancements

- [ ] Add more news sources (external news sites)
- [ ] Implement full-text search
- [ ] Add news bookmarking for users
- [ ] Email notifications for breaking news
- [ ] Admin dashboard for news management
- [ ] RSS feed support
- [ ] Social media integration
