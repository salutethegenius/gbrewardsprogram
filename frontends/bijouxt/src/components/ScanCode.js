import { useEffect, useState } from "react";
import requests from "../handlers/requests";
import Company from "../utilities/Company";
import Flexbox from "./Flexbox";
import { LeapFrog } from "@uiball/loaders";
import Spacebox from "./Spacebox";
import cookies from "../utilities/Cookies";
import Button from "./Button";

const ScanCode = ({ setOpen, setSeverity, setToastMsg, setLoading, setOpenScanner, loadData }) => {
    let barcode = '';
    let interval;

    const token = cookies.getCookies('admin-token');


    const [isLoading, setIsLoading] = useState(true)
    const [user, setUser] = useState(null)
    
    const [amount, setAmount] = useState('')

    const [aLoading, setALoading] = useState(true)
    const [rLoading, setRLoading] = useState(true)

    const handleBarcode = (code) => {
        const url = `${process.env.REACT_APP_SERVER}api/admin/user?token=${token}&sid=${Company.store_id}&uid=${code}`

        requests.makeGet(url, setOpen, setSeverity, setToastMsg, setLoading,
            (res) => {
                setUser(res.user)
                setIsLoading(false)
            },
            null
        )

    }

    const handleClick = () => {
        if (amount !== '') {
            setALoading(true)
            let points = parseFloat(amount) * Company.points_per_amount

            const url = `${process.env.REACT_APP_SERVER}api/admin/user/points?token=${token}&sid=${Company.store_id}&uid=${user.id}`

            requests.makePost(url, { points: points, user_points: (user.points + points), amount: parseFloat(amount) }, setOpen, setSeverity, setToastMsg, setALoading,
                (res) => {
                    loadData()
                    setOpenScanner(false)
                },
                "User points added successfully"
            )
        } else {
            setToastMsg('Invalid amount')
            setSeverity("error")
            setOpen(true)
        }
    }

    const handleRedeem = () => {
        if (window.confirm("You are about to redeem " + user.fullname + "'s points?")) {
            if (user.points > 0) {
                setRLoading(true)
                const url = `${process.env.REACT_APP_SERVER}api/admin/user/redeem?token=${token}&sid=${Company.store_id}&uid=${barcode}`

                requests.makeGet(url, setOpen, setSeverity, setToastMsg, setRLoading,
                    (res) => {
                        loadData()
                        setOpenScanner(false)
                    },
                    "User points redeemed"
                )
            }else {
                setToastMsg("User has insufficient points")
                setSeverity("error")
                setOpen(true)
            }
        }
    }

    const activateScanner = () => {
        document.onkeydown = (e) => {
            if (interval)
                clearInterval(interval)
            if (e.code === "Enter") {
                if (barcode)
                    handleBarcode(barcode)
                barcode = ''
                return
            }
            if (e.key !== 'Shift')
                barcode += e.key;
            interval = setInterval(() => barcode = '', 20);
    
        }
    }

    useEffect(() => {
        activateScanner()
        // eslint-disable-next-line
    }, [])

    return (
        <Flexbox justifyContent="center" alignItems="center" className="scan-code" style={{ height: '100%', width: '100%', background: '#00000050', position: 'fixed', top: 0, left: 0 }}>
            {isLoading && <Flexbox justifyContent="center" alignItems="center" style={{ height: '400px' }}>
                <div style={{ textAlign: 'center' }}>
                    <Flexbox justifyContent="center" alignItems="center">
                        <LeapFrog size={30} color="var(--primary)" />
                    </Flexbox>
                    <Spacebox padding="10px" />
                    <small style={{ fontSize: '13px', opacity: .5, color: 'white' }}>Scanning QR Code</small>
                    <Spacebox padding="10px" />
                    <Button style={{ borderRadius: '5px', background: 'var(--primary)', color: 'white', padding: '10px 20px' }} handleClick={() => setOpenScanner(false)}>
                        <Flexbox justifyContent="space-between" alignItems="center">
                            <span style={{ color: 'white' }}>Close scanner</span>
                        </Flexbox>
                    </Button>
                </div>
            </Flexbox>}
            {user && <div style={{ height: '200px', width: '400px', background: 'white', padding: '20px', borderRadius: '10px' }}>
                <Flexbox alignItems="center" justifyContent="space-between">
                    <div>
                        <small style={{ fontSize: '13px', opacity: .5 }}>Fullname</small>
                        <div></div>
                        <span style={{ fontSize: '20px' }}>
                            <b>
                                {user.fullname}
                            </b>
                        </span>
                    </div>
                    <div>
                        <small style={{ fontSize: '13px', opacity: .5 }}>Current Points</small>
                        <div></div>
                        <span style={{ fontSize: '20px' }}>
                            <b>
                                {user.points}
                            </b>
                        </span>
                    </div>
                </Flexbox>
                <Spacebox padding="10px" />
                <Button style={{ background: 'white', color: 'var(--primary)', borderRadius: '10px', padding: '15px 10px', width: '100%' }} handleClick={handleRedeem}>
                    {rLoading ? "Please wait..." : "Redeem Points →"}
                </Button>
                <Spacebox padding="20px" />
                <span>Total Amount</span>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                <Spacebox padding="10px" />
                <Flexbox alignItems="center" justifyContent="space-between">
                    <Button style={{ background: 'var(--primary)', color: 'white', borderRadius: '10px', padding: '15px 10px', width: '100%' }} handleClick={handleClick}>
                        {aLoading ? "Please wait" : "Award Points →"}
                    </Button>
                </Flexbox>
            </div>}
        </Flexbox>
    );
}

export default ScanCode;