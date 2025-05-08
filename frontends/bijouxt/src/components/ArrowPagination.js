import { useEffect, useState } from "react";
import Flexbox from "./Flexbox";
import Spacebox from "./Spacebox";

const ArrowPagination = ({ data, setShowData, limit }) => {
    const [currentIndex, setCurrentIndex] = useState(0)

    // if data is empty
    if(data.length === 0) {
        setShowData([])
    }
    // number of visible data
    const data_len = data.length
    // number of pages(buttons) to render
    const num_pages = Math.ceil(data_len / limit) //round up if pages is a floating point
    let empty_btn_arr = []
    for (let i = 0; i < num_pages; i++) {
        empty_btn_arr.push(i + 1)
    }

    let counter = 0
    let breakpoints = [] // this will become an array of arrays, holding broken down arrays of the main array(data) depending on the limit

    // create breakpoints for each data page
    for (let x = 0; x < num_pages; x++) {
        let arr = []
        for (let y = 0; y < limit; y++) {
            arr[y] = counter
            counter++
        }
        breakpoints[x] = arr
    }

    const setDataToShow = index => {
        let start_index = breakpoints[index][0]
        let end_index = breakpoints[index][breakpoints[index].length - 1]
        let dataToshow = data.slice(start_index, end_index + 1) // add 1 to ensure the element at index "end_index" is included.
        setShowData(dataToshow)
        setCurrentIndex(index)
    }

    const handleLeftClick = () => {
        if (currentIndex === 0) {

        } else if (currentIndex < 0) {
            setCurrentIndex(0)
            setDataToShow(0)
        } else {
            let index = currentIndex
            setCurrentIndex(index - 1)
            setDataToShow(index - 1)
        }
    }

    const handleRightClick = () => {
        if (currentIndex === num_pages - 1) {
            setCurrentIndex(num_pages - 1)
        } else {
            let index = currentIndex
            setCurrentIndex(index + 1)
            setDataToShow(index + 1)
        }
    }

    useEffect(() => {
        // if data isn't empty
        if (data.length > 0) {
            // run data on index 0 the first time it loads
            setDataToShow(0)
        }
        // eslint-disable-next-line
    }, [])

    return (
        <div className="pagination" style={{display: 'flex', justifyContent: 'flex-end'}}>
            {data.length > 0 ? <Flexbox alignItems="center">
                <span>Page: {currentIndex + 1} of {num_pages}</span>
                <Spacebox padding="10px" />
                <div onClick={handleLeftClick} style={{ background: currentIndex === 0 ? 'grey' : 'var(--primary)', display: 'flex', alignItems: "center", justifyContent: "center", width: '30px', height: '30px', borderRadius: '1000px', cursor: 'pointer', opacity: currentIndex === 0 ? .6 : 1 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                </div>
                <Spacebox padding="10px" />
                <div onClick={handleRightClick} style={{ background: currentIndex === num_pages - 1 ? 'grey' : 'var(--primary)', display: 'flex', alignItems: "center", justifyContent: "center", width: '30px', height: '30px', borderRadius: '1000px', cursor: 'pointer', opacity: currentIndex === num_pages - 1 ? .6 : 1 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-arrow-right"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </div>
            </Flexbox> : <div></div>}
        </div>
    );
}

export default ArrowPagination;