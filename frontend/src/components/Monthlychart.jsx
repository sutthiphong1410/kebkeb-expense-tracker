import {BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid} from 'recharts'

const transformData = (byMonth) => {
    const map = {}
    byMonth.forEach(({ month, type, total }) => {
        if (!map[month]) map[month] = {month, income:0, expense:0}
        map[month][type] = total
    })
    return Object.values(map)
}

const Monthlychart = ({ data }) => {
    const chartData = transformData(data)

    if(chartData.length === 0){
        return <p className='text-ink/50 text-sm py-12 text-center'>ยังไม่มีข้อมูลให้แสดงกราฟ</p>
    }
  return (
    <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData}>
            <CartesianGrid strokeDasharray={'3 3'} stroke='#e3e0d4'/>
            <XAxis dataKey={'month'} tick={{ fontSize:12 }}/>
            <YAxis tick={{ fontSize: 12 }}/>
            <Tooltip formatter={(value) => `${Number(value).toLocaleString('th-TH')}`}/>
            <Legend/>
            <Bar dataKey={'income'} name={'รายรับ'} fill='#2a6f77'/>
            <Bar dataKey={'expense'} name={'รายจ่าย'} fill='#c1440e'/>
        </BarChart>
    </ResponsiveContainer>
  )
}
export default Monthlychart