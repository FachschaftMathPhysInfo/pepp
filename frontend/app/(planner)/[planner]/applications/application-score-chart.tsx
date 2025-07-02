import {Applicant} from "@/app/(planner)/[planner]/applications/application-info-section";
import {Bar, BarChart, XAxis} from "recharts";
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart";
import {useCallback, useEffect, useState} from "react";

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
    const scoreMap = new Map<number, number>()
    applicants.forEach(applicant => {
      const application = applicant.applications?.find(
        application => application.event.ID === umbrellaID
      )

      if (!application) return

      scoreMap.set(application.score, (scoreMap.get(application.score) || 0) + 1);
    })

    const data: {score: number, amount: number}[] = []
    scoreMap.forEach((score, amount) => {
      data.push({score, amount})
    })


    console.log(data)
    setChartData(data)
  }, [applicants, umbrellaID])

  useEffect(() => {
    void calculateChartData
  }, [applicants, umbrellaID]);

  const chartConfig: ChartConfig = {
    amount: {
      label: "Anzahl Anmeldungen",
      color: "#var(--chart-1)"
    }
  }

  if(chartData.length === 0) {
    return <div className={'w-full h-full text-center'}>Noch keine Anmeldungen zum berechnen</div>
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
        <ChartTooltip content={<ChartTooltipContent />} />
      </BarChart>
    </ChartContainer>
  )
}
