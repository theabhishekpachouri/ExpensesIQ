import incomeModel from "../models/incomeModel.js";
import expenseModel from "../models/expenseModel.js";
import { parse } from "dotenv";



    export async function getDashboardOverview(req, res) {
        try {
        const userId = req.user._id;
        const { filter, month, year, range } = req.query;

        const now = new Date();
        let dateFilter = {};

        // 1. SPECIFIC MONTH & YEAR (e.g., ?month=5&year=2026)
        if (month) {
        const targetYear = year ? parseInt(year) : now.getFullYear();
        const targetMonth = parseInt(month) - 1; // JS months 0-11 hote hain

        const startOfMonth = new Date(targetYear, targetMonth, 1);
        const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

        dateFilter = { $gte: startOfMonth, $lte: endOfMonth };
        } 

        // 2. SPECIFIC YEAR ONLY (e.g., ?year=2025)
        else if (year) {
        const targetYear = parseInt(year);

        const startOfYear = new Date(targetYear, 0, 1);
        const endOfYear = new Date(targetYear, 11, 31, 23, 59, 59, 999);

        dateFilter = { $gte: startOfYear, $lte: endOfYear };
        } 

        // 3. TODAY
        else if (filter === 'today' || range === 'daily'  ) {
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        dateFilter = { $gte: startOfToday, $lte: endOfToday };
        } 

        // 4. THIS WEEK
        else if (filter === 'week' || range === 'weekly') {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday se start
        startOfWeek.setHours(0, 0, 0, 0);

        dateFilter = { $gte: startOfWeek, $lte: now };
        } 

        // 5. THIS MONTH
        else if (filter === 'month' || range === 'monthly') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        dateFilter = { $gte: startOfMonth, $lte: endOfMonth };
        } 

        // 6. THIS YEAR
        else if (filter === 'year') {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

        dateFilter = { $gte: startOfYear, $lte: endOfYear };
        }
        
        // 7. ALL TIME (agar filter="all" ho ya koi param na ho) -> dateFilter empty {} rahega

        // Query Object Construct
        const query = { userId };
        if (dateFilter.$gte) {
        query.date = dateFilter;
        }

        const incomes = await incomeModel.find(query).lean();
        const expenses = await expenseModel.find(query).lean();
 

        const totalIncome = incomes.reduce((acc, cur) => acc + Number(cur.amount || 0), 0);
        const totalExpense = expenses.reduce((acc, cur) => acc + Number(cur.amount || 0), 0);
        const savings = totalIncome - totalExpense;
        const savingsRate = totalIncome === 0 ? 0 : Math.round((savings / totalIncome) * 100);

        const recentTransactions = [
        ...incomes.map((i) => ({ ...i, type: "income" })),
        ...expenses.map((e) => ({ ...e, type: "expense" })),
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const spendByCategory = {};
        for (const exp of expenses) {
        const cat = exp.category || "Other";
        spendByCategory[cat] = (spendByCategory[cat] || 0) + Number(exp.amount || 0);
        }

        const expenseDistribution = Object.entries(spendByCategory).map(([category, amount]) => ({
        category,
        amount,
        percent: totalExpense === 0 ? 0 : Math.round((amount / totalExpense) * 100),
        }));

        //  for chart 

        return res.status(200).json({
            success:true,
            data:{
                totalIncome,
                totalExpense,
                savings,
                savingsRate,
                recentTransactions,
                spendByCategory,
                expenseDistribution 
            }
        });

    }
    catch (error) {
        console.error("getDashboardOverview  Error : ",error);
        return res.status(500).json({
            success:false,
            message:"Dashboard fatch failed ",
            error:error.message
        });
    }
}    