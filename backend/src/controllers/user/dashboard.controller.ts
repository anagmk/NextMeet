export const getDashboardOverview = async (_req: any, res: any) => {
  try {
    return res.status(200).json({
      message: "Dashboard overview ready",
      data: {
        meetings: [],
        stats: {},
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching dashboard overview", error });
  }
};