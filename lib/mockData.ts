export interface RestaurantClient {
    id: string;
    clientCode: string;
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
        clientCode: 'D-013',
        name: 'Baracoa Cuban Restaurant',
        dailySpend: 65,
        roas: 1.83,
        strategySummary: 'Baracoa Cuban Restaurant (D-013) Google Ads performance optimization. Focus on high-intent search terms and geographic targeting.',
        status: 'active',
        lastUpdated: '1 day ago',
    },
    {
        id: '2',
        clientCode: 'D-001',
        name: 'Burger Bar',
        dailySpend: 450,
        roas: 3.2,
        strategySummary: 'Focus on lunch promotions with geo-targeted ads in downtown area. Emphasize quick service and premium ingredients.',
        status: 'active',
        lastUpdated: '2 hours ago',
    },
    {
        id: '3',
        clientCode: 'D-002',
        name: 'Taco Town',
        dailySpend: 680,
        roas: 4.1,
        strategySummary: 'Late-night delivery campaigns performing exceptionally well. Increase budget for 9PM-12AM slots.',
        status: 'active',
        lastUpdated: '30 minutes ago',
    },
    {
        id: '4',
        clientCode: 'D-003',
        name: 'Sushi Supreme',
        dailySpend: 920,
        roas: 2.8,
        strategySummary: 'Premium positioning with focus on quality and authenticity. Target alpha neighborhoods with carousel ads.',
        status: 'active',
        lastUpdated: '1 hour ago',
    },
    {
        id: '5',
        clientCode: 'D-004',
        name: 'Pizza Palace',
        dailySpend: 340,
        roas: 3.9,
        strategySummary: 'Family-oriented campaigns with emphasis on value deals. Strong performance on weekends.',
        status: 'paused',
        lastUpdated: '5 hours ago',
    },
];
