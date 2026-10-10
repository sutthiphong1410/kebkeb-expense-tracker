import {PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer} from 'recharts'

const COLORS = ['#1b4332', '#c9a227', '#2a6f77', '#c1440e', '#6b8f71', '#a3752b', '#4a7c85'];

const Categorychart = ({data}) => {
    if(data.length === 0){
        return <p className='text-ink/50 text-sm py-12 text-center'>ยังไม่มีข้อมูลรายจ่ายให้แสดงกราฟ</p>
    }
  return (
    <ResponsiveContainer width="100%" height={280}>
        <PieChart>
            <Pie 
                data={data}
                dataKey='total'
                nameKey='category'
                cx='50%'
                cy='50%'
                outerRadius={90}
                label={(entry)=> entry.category}
            >
                {data.map((_, index)=> (
                    <Cell key={index} fill={COLORS[index % COLORS.length]}/>
                ))}
            </Pie>
            <Tooltip formatter={(value) => `${Number(value).toLocaleString('th-TH')}`}/>
            <Legend/>
        </PieChart>
    </ResponsiveContainer>
  )
}
export default Categorychart