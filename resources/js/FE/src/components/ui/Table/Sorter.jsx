import { TbArrowsSort, TbSortAscending, TbSortDescending } from 'react-icons/tb'
import classNames from '../utils/classNames'

const Sorter = ({ sort, className }) => {
    const color = 'text-primary'

    const renderSort = () => {
        if (typeof sort === 'boolean') {
            return <TbArrowsSort />
        }

        if (sort === 'asc') {
            return <TbSortAscending className={color} />
        }

        if (sort === 'desc') {
            return <TbSortDescending className={color} />
        }

        return null
    }

    return (
        <div className={classNames('inline-flex', className)}>
            {renderSort()}
        </div>
    )
}

export default Sorter
