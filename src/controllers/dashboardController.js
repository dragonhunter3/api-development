const Notification = require('../models/Notification');
const MaterialPrice = require('../models/MaterialPrice');

// Calculate Greeting based on local hour
const getGreeting = (name, offsetInMinutes) => {
  let date = new Date();
  if (offsetInMinutes) {
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    date = new Date(utc + (3600000 * (parseInt(offsetInMinutes) / -60)));
  }
  const hour = date.getHours();

  let greeting = 'Good Evening';
  if (hour >= 5 && hour < 12) {
    greeting = 'Good Morning';
  } else if (hour >= 12 && hour < 17) {
    greeting = 'Good Afternoon';
  }

  return `${greeting}, ${name || 'Shahid'} 👋`;
};

// Fetch weather details
const fetchWeather = async (city, apiKey) => {
  const defaultCity = city || 'Lahore, Pakistan';

  if (!apiKey) {
    return {
      temp: 32,
      condition: 'Sunny',
      icon: '01d',
      location: defaultCity,
      humidity: '45%',
      windSpeed: '12 km/h'
    };
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city || 'Lahore')}&units=metric&appid=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();

    if (res.ok) {
      return {
        temp: Math.round(data.main.temp),
        condition: data.weather[0].main,
        icon: data.weather[0].icon,
        location: `${data.name}, ${data.sys.country}`,
        humidity: `${data.main.humidity}%`,
        windSpeed: `${Math.round(data.wind.speed * 3.6)} km/h`
      };
    }
  } catch (err) {
    console.error('Weather API fetch failed:', err.message);
  }

  return {
    temp: 32,
    condition: 'Sunny',
    icon: '01d',
    location: defaultCity,
    humidity: '45%',
    windSpeed: '12 km/h'
  };
};

// Seed default construction material prices in database
const seedDefaultPrices = async (userId, currency) => {
  const defaults = {
    PKR: [
      { material: 'Cement', price: 1450, unit: 'bag', change: '+1.2%', trend: 'up' },
      { material: 'Steel', price: 260, unit: 'kg', change: '-0.8%', trend: 'down' },
      { material: 'Sand', price: 105, unit: 'cft', change: '0%', trend: 'stable' },
      { material: 'Bricks', price: 15, unit: 'piece', change: '+3.5%', trend: 'up' }
    ],
    USD: [
      { material: 'Cement', price: 7.5, unit: 'bag', change: '+0.5%', trend: 'up' },
      { material: 'Steel', price: 0.95, unit: 'kg', change: '-1.2%', trend: 'down' },
      { material: 'Sand', price: 0.38, unit: 'cft', change: '0%', trend: 'stable' },
      { material: 'Bricks', price: 0.08, unit: 'piece', change: '+2.1%', trend: 'up' }
    ],
    AED: [
      { material: 'Cement', price: 27.5, unit: 'bag', change: '+0.8%', trend: 'up' },
      { material: 'Steel', price: 3.5, unit: 'kg', change: '-1.0%', trend: 'down' },
      { material: 'Sand', price: 1.4, unit: 'cft', change: '0%', trend: 'stable' },
      { material: 'Bricks', price: 0.3, unit: 'piece', change: '+2.5%', trend: 'up' }
    ]
  };

  const list = defaults[currency] || defaults['PKR'];
  const seeded = [];

  for (const item of list) {
    const rate = await MaterialPrice.create({
      userId,
      currency,
      material: item.material,
      price: item.price,
      unit: item.unit,
      change: item.change,
      trend: item.trend
    });
    seeded.push(rate);
  }

  return seeded;
};

// Simulate dynamic market updates by fluctuating rates on request
const fluctuatePrices = async (userId, currency) => {
  let prices = await MaterialPrice.find({ userId, currency });

  if (prices.length === 0) {
    return await seedDefaultPrices(userId, currency);
  }

  const updatedPrices = [];

  for (let item of prices) {
    // Generate minor fluctuations between -1.5% and +1.5%
    const percentChange = (Math.random() * 3 - 1.5);

    if (Math.abs(percentChange) < 0.1) {
      updatedPrices.push(item);
      continue;
    }

    const oldPrice = item.price;
    let newPrice = oldPrice * (1 + percentChange / 100);

    // Format precision based on currency/material
    if (item.material === 'Steel' || item.material === 'Sand' || currency !== 'PKR') {
      newPrice = Math.round(newPrice * 100) / 100;
    } else {
      newPrice = Math.round(newPrice);
    }

    const diff = newPrice - oldPrice;
    let trend = 'stable';
    let changeStr = '0%';

    if (diff > 0) {
      trend = 'up';
      changeStr = `+${((diff / oldPrice) * 100).toFixed(1)}%`;
    } else if (diff < 0) {
      trend = 'down';
      changeStr = `${((diff / oldPrice) * 100).toFixed(1)}%`;
    }

    item.price = newPrice;
    item.change = changeStr;
    item.trend = trend;
    await item.save();

    updatedPrices.push(item);
  }

  return updatedPrices;
};

// Mock Projects
const getRecentProjects = () => {
  return [
    {
      id: 'proj-mock-01',
      name: 'Al-Haram Heights (Commercial)',
      progress: 65,
      status: 'In Progress',
      startDate: '2026-03-01'
    },
    {
      id: 'proj-mock-02',
      name: 'Defense Villa Phase 6',
      progress: 20,
      status: 'Excavation',
      startDate: '2026-06-15'
    },
    {
      id: 'proj-mock-03',
      name: 'Model Town House Renovation',
      progress: 90,
      status: 'Finishing',
      startDate: '2026-05-10'
    }
  ];
};

// Mock Calculations
const getRecentCalculations = () => {
  return [
    {
      id: 'calc-mock-01',
      calculator: 'Concrete Calculator',
      description: 'Slab Area - 1500 sq ft',
      result: 'Cement: 250 bags, Sand: 500 cft, Crush: 1000 cft',
      date: '2026-07-14'
    },
    {
      id: 'calc-mock-02',
      calculator: 'Brick Calculator',
      description: 'Boundary Wall - 100 ft x 6 ft',
      result: 'Bricks: 6,500 pieces, Cement: 30 bags',
      date: '2026-07-13'
    },
    {
      id: 'calc-mock-03',
      calculator: 'Steel Estimator',
      description: 'Foundation Rebar reinforcement',
      result: 'Steel Required: 1.2 Tons (Grade 60)',
      date: '2026-07-12'
    }
  ];
};

// Mock Reports
const getRecentReports = () => {
  return [
    {
      id: 'rep-mock-01',
      name: 'Al-Haram-Foundation-Report.pdf',
      size: '1.2 MB',
      date: '2026-07-14'
    },
    {
      id: 'rep-mock-02',
      name: 'Villa-Cost-Estimate-Summary.pdf',
      size: '480 KB',
      date: '2026-07-12'
    }
  ];
};

// AI Suggestion Box
const getAISuggestion = () => {
  const suggestions = [
    "To avoid shrinkage cracks, ensure water curing for the newly poured concrete slab is maintained for at least 7 to 10 days.",
    "Using OPC (Ordinary Portland Cement) is recommended for structural foundations, while PPC (Portland Pozzolana Cement) is excellent for plastering and brick masonry due to slower heat of hydration.",
    "When reinforcing foundation beams, ensure a minimum clear cover of 50mm to protect the rebars from rust and soil moisture.",
    "Before brick masonry begins, pre-soak the bricks thoroughly in water so they do not absorb moisture from the cement mortar, which weakens the bond."
  ];
  const index = Math.floor(Math.random() * suggestions.length);

  return {
    title: "BuildMate AI Site Advisor",
    message: suggestions[index],
    recommendation: "Consult AI Assistant for concrete mix designs."
  };
};

// @desc    Get complete unified dashboard widgets payload
// @route   GET /api/v1/dashboard
// @access  Private (Requires JWT)
exports.getDashboard = async (req, res, next) => {
  try {
    const { city, timezoneOffset } = req.query;

    // 1. Calculate time-aware greeting
    const greeting = getGreeting(req.user.name, timezoneOffset);

    // 2. Fetch Weather status
    const weather = await fetchWeather(city, process.env.WEATHER_API_KEY);

    // 3. Retrieve/Fluctuate material prices dynamically
    const currency = req.user.preferredCurrency || 'PKR';
    const rawPrices = await fluctuatePrices(req.user._id, currency);

    const materialPrices = rawPrices.map(item => ({
      material: item.material,
      price: item.price,
      unit: item.unit,
      change: item.change,
      trend: item.trend,
      displayPrice: `${item.currency} ${item.price.toLocaleString()}/${item.unit}`
    }));

    // 4. Query live unread notifications count
    const unreadNotificationsCount = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false
    });

    // 5. Gather other dashboard blocks
    const recentProjects = getRecentProjects();
    const recentCalculations = getRecentCalculations();
    const recentReports = getRecentReports();
    const aiSuggestion = getAISuggestion();

    res.status(200).json({
      success: true,
      data: {
        greeting,
        avatar: req.user.avatar || '',
        unreadNotificationsCount,
        weather,
        materialPrices,
        quickTools: [
          'Area Calculator',
          'Brick Calculator',
          'Concrete Calculator',
          'Steel Calculator',
          'Paint Calculator',
          'Tile Calculator',
          'Cost Estimator'
        ],
        recentProjects,
        recentActivity: {
          recentCalculations,
          recentReports
        },
        aiSuggestion
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Manually update/override a material price (BuildMate Pro cost tuning)
// @route   PUT /api/v1/dashboard/materials
// @access  Private (Requires JWT)
exports.updateMaterialPrice = async (req, res, next) => {
  try {
    const { material, price, currency } = req.body;

    if (!material || price === undefined || !currency) {
      return res.status(400).json({ success: false, error: 'Please provide material, price, and currency' });
    }

    let rate = await MaterialPrice.findOne({
      userId: req.user._id,
      material,
      currency
    });

    if (!rate) {
      // Seed default list first if not exists, then search again
      await seedDefaultPrices(req.user._id, currency);
      rate = await MaterialPrice.findOne({
        userId: req.user._id,
        material,
        currency
      });
    }

    const oldPrice = rate.price;
    const diff = price - oldPrice;
    let trend = 'stable';
    let changeStr = '0%';

    if (diff > 0) {
      trend = 'up';
      changeStr = `+${((diff / oldPrice) * 100).toFixed(1)}%`;
    } else if (diff < 0) {
      trend = 'down';
      changeStr = `${((diff / oldPrice) * 100).toFixed(1)}%`;
    }

    rate.price = price;
    rate.change = changeStr;
    rate.trend = trend;
    await rate.save();

    res.status(200).json({
      success: true,
      message: `${material} price updated successfully`,
      rate: {
        material: rate.material,
        price: rate.price,
        unit: rate.unit,
        change: rate.change,
        trend: rate.trend,
        currency: rate.currency,
        displayPrice: `${rate.currency} ${rate.price.toLocaleString()}/${rate.unit}`
      }
    });
  } catch (error) {
    next(error);
  }
};
