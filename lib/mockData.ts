export interface RestaurantClient {
    id: string;
    name: string;
    dailySpend: number;
    roas: number;
    strategySummary: string;
    status: 'active' | 'paused' | 'pending';
    lastUpdated: string;
}

export const mockClients: RestaurantClient[] = [
    {
        id: '1',
        name: 'Burger Bar',
        dailySpend: 450,
        roas: 3.2,
        strategySummary: 'Focus on lunch promotions with geo-targeted ads in downtown area. Emphasize quick service and premium ingredients.',
        status: 'active',
        lastUpdated: '2 hours ago',
    },
    {
        id: '2',
        name: 'Taco Town',
        dailySpend: 680,
        roas: 4.1,
        strategySummary: 'Late-night delivery campaigns performing exceptionally well. Increase budget for 9PM-12AM slots.',
        status: 'active',
        lastUpdated: '30 minutes ago',
    },
    {
        id: '3',
        name: 'Sushi Supreme',
        dailySpend: 920,
        roas: 2.8,
        strategySummary: 'Premium positioning with focus on quality and authenticity. Target affluent neighborhoods with carousel ads.',
        status: 'active',
        lastUpdated: '1 hour ago',
    },
    {
        id: '4',
        name: 'Pizza Palace',
        dailySpend: 340,
        roas: 3.9,
        strategySummary: 'Family-oriented campaigns with emphasis on value deals. Strong performance on weekends.',
        status: 'paused',
        lastUpdated: '5 hours ago',
    },
    {
        id: '5',
        name: 'Noodle House',
        dailySpend: 520,
        roas: 3.5,
        strategySummary: 'Authentic Asian cuisine positioning. Video content showcasing cooking process drives highest engagement.',
        status: 'active',
        lastUpdated: '45 minutes ago',
    },
];
