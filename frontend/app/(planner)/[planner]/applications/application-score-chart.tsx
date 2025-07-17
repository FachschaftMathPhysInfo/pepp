import {Applicant} from "@/app/(planner)/[planner]/applications/application-info-section";
import {Bar, BarChart, XAxis} from "recharts";
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart";
import {useCallback, useEffect, useState} from "react";
import {Skeleton} from "@/components/ui/skeleton";

interface ApplicationScoreChartProps {
  applicants: Applicant[]
  umbrellaID: number
}

type ChartData = {
  score: number
  amount: number
}

export default function ApplicationScoreChart({applicants, umbrellaID}: ApplicationScoreChartProps) {
  const [chartData, setChartData] = useState<ChartData[]>([])

  const calculateChartData = useCallback(async () => {
    // [score: amountOfApplicants]
    const scoreMap = new Map<number, number>()

    applicants.forEach(applicant => {
      const application = applicant.applications?.find(
        application => application.event.ID === umbrellaID
      )

      if (!application) return

      scoreMap.set(application.score, (scoreMap.get(application.score) || 0) + 1);
    })

    const sortedArray = Array.from(scoreMap)
      .sort((a, b) => a[0] - b[0]);
    const sortedMap = new Map(sortedArray);

    const data: { score: number, amount: number }[] = []
    sortedMap.forEach((value, key) => {
      data.push({score: key, amount: value})
    })


    console.log(data)
    setChartData(data)
  }, [applicants, umbrellaID])

  useEffect(() => {
    void calculateChartData()
  }, [applicants, umbrellaID]);

  const chartConfig: ChartConfig = {
    amount: {
      label: "Amount",
      color: "#var(--chart-1)"
    }
  }

  if (chartData.length === 0) {
    return (
      <div className={'w-full h-full min-h-[200px] relative'}>
        <Skeleton className={'w-full min-h-[200px]'} />
        <span className={'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'}>
          Noch keine Anmeldungen zum berechnen
        </span>
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className={'w-full min-h-[200px] h-full'}>
      <BarChart accessibilityLayer data={chartData}>
        <Bar dataKey={'amount'} fill="var(--chart-1)" radius={4}/>
        <XAxis
          dataKey="score"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <ChartTooltip content={<ChartTooltipContent/>}/>
      </BarChart>
    </ChartContainer>
  )
}
