
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'default';
    case 'in_progress': return 'secondary';
    case 'scheduled': return 'outline';
    case 'cancelled': return 'destructive';
    default: return 'outline';
  }
};

export const getTypeDisplay = (type: string) => {
  switch (type) {
    case 'initial': return 'Initial';
    case 'follow_up': return 'Follow-up';
    case 'annual': return 'Annual';
    case 'referral': return 'Referral';
    default: return type;
  }
};

export const groupScreeningsByRecency = (screenings: any[]) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const recentScreenings = screenings.filter(
    screening => new Date(screening.screening_date) >= sixMonthsAgo
  );

  const historicalScreenings = screenings.filter(
    screening => new Date(screening.screening_date) < sixMonthsAgo
  );

  // Group historical screenings by year
  const groupedHistorical = historicalScreenings.reduce((acc, screening) => {
    const year = new Date(screening.screening_date).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(screening);
    return acc;
  }, {} as Record<number, any[]>);

  return { recentScreenings, groupedHistorical };
};
