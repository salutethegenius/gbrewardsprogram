import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { useEffect, useState } from "react";
import Flexbox from "../../components/Flexbox";
import { Container, IconButton, Skeleton, Typography } from "@mui/material";
import Grid from "../../components/Grid";
import cookies from "../../utilities/Cookies";
import Company from "../../utilities/Company";
import Toast from "../../components/Toast";
import Button from "../../components/Button";
import Spacebox from "../../components/Spacebox";
import requests from "../../handlers/requests";
import ArrowPagination from "../../components/ArrowPagination";
import ScanCode from "../../components/ScanCode";
import { Close } from "@mui/icons-material";

const Dashboard = ({ title }) => {
    document.querySelector("title").innerHTML = title

    const navigate = useNavigate()

    const token = cookies.getCookies('admin-token');
    const [, setAdmin] = useState(null)

    const [open, setOpen] = useState(false);
    const [severity, setSeverity] = useState('success');
    const [msg, setToastMsg] = useState('');

    const [loading, setLoading] = useState(true)
    const [isLoading, setIsLoading] = useState(true)
    const [users, setUsers] = useState(null)

    const [paginationData, setPaginationData] = useState(null)
    const [points, setPoints] = useState(null)

    const oneDay = 24 * 60 * 60 * 1000;
    const dates =
        [
            (Date.now() - oneDay),
            (Date.now()),
            (Date.now() + oneDay),
            (Date.now() + (2 * oneDay)),
            (Date.now() + (3 * oneDay)),
            (Date.now() + (4 * oneDay)),
        ]

    const day = (day) => {
        if (day === 0)
            return 'Sun'
        else if (day === 1)
            return 'Mon'
        else if (day === 2)
            return 'Tue'
        else if (day === 3)
            return 'Wed'
        else if (day === 4)
            return 'Thu'
        else if (day === 5)
            return 'Fri'
        else if (day === 6)
            return 'Sat'
    }

    const navigators = [
        {
            name: 'Award Points',
        },
        {
            name: 'Redeem Points',
        },
    ]

    const [currentTab, setCurrentTab] = useState(0)

    const openSidebar = (stateUpdate) => {
        stateUpdate(true)
        setTimeout(() => {
            document.querySelector('.sidebar').classList.add('slow-show')
        }, 500);
    }

    const closeSidebar = (stateUpdate) => {
        document.querySelector('.sidebar').classList.remove('slow-show')
        setTimeout(() => {
            stateUpdate(false)
        }, 500);
    }

    const [openScanner, setOpenScanner] = useState(false)
    const [openBarcode, setOpenBarcode] = useState(false)
    const [barcode, setBarcode] = useState("")
    const [bLoading, setBLoading] = useState(false)
    const [user, setUser] = useState(null)
    const [amount, setAmount] = useState('')

    const [aLoading, setALoading] = useState(false)
    const [rLoading, setRLoading] = useState(false)

    const getUser = () => {
        if (barcode !== '') {
            setBLoading(true)

            const url = `${process.env.REACT_APP_SERVER}api/admin/user?token=${token}&sid=${Company.store_id}&uid=${barcode}`

            requests.makeGet(url, setOpen, setSeverity, setToastMsg, setBLoading,
                (res) => {
                    setUser(res.user)
                },
                null
            )

        } else {
            setToastMsg("Can not process empty code")
            setSeverity('error')
            setOpen(true)
        }
    }


    const handleClick = () => {
        if (amount !== '') {
            setALoading(true)
            let points = parseFloat(amount) * Company.points_per_amount

            const url = `${process.env.REACT_APP_SERVER}api/admin/user/points?token=${token}&sid=${Company.store_id}&uid=${user.id}`

            requests.makePost(url, { points: points, user_points: (user.points + points), amount: parseFloat(amount) }, setOpen, setSeverity, setToastMsg, setALoading,
                (res) => {
                    loadData()
                    closeSidebar(setOpenBarcode)
                },
                "User points added successfully"
            )
        } else {
            setToastMsg('Invalid amount')
            setSeverity("error")
            setOpen(true)
        }
    }

    const loadData = () => {
        setLoading(true)
        setIsLoading(true)

        requests.makeGet(`${process.env.REACT_APP_SERVER}api/admin/users?token=${token}&sid=${Company.store_id}`, setOpen, setSeverity, setToastMsg, setIsLoading,
            (res) => {
                setUsers(res.data)
            },
            null
        )

        requests.makeGet(`${process.env.REACT_APP_SERVER}api/admin/points?token=${token}&sid=${Company.store_id}`, setOpen, setSeverity, setToastMsg, setLoading,
            (res) => {
                setPoints(res.points + "")
            },
            null
        )
    }

    const handleRedeem = () => {
        if (window.confirm("You are about to redeem " + user.fullname + "'s points?")) {
            if (user.points > 0) {
                setRLoading(true)
                const url = `${process.env.REACT_APP_SERVER}api/admin/user/redeem?token=${token}&sid=${Company.store_id}&uid=${barcode}`

                requests.makeGet(url, setOpen, setSeverity, setToastMsg, setRLoading,
                    (res) => {
                        loadData()
                        closeSidebar(setOpenBarcode)
                    },
                    "User points redeemed"
                )
            } else {
                setToastMsg("User has insufficient points")
                setSeverity("error")
                setOpen(true)
            }
        }
    }


    useEffect(() => {
        const token = cookies.getCookies('admin-token');

        if (token === '' || token === undefined || token === null) {
            navigate('/admin');
        }

        const stringify_user = cookies.getCookies('admin');
        if (stringify_user.length > 10) {
            const user_ = JSON.parse(stringify_user)
            setAdmin(user_)
        } else {
            navigate('/admin')
        }

        loadData()

        //eslint-disable-next-line
    }, [])
    return (
        <div className="admin-dashboard">
            <Toast open={open} setOpen={setOpen} severity={severity} timer={4000}>{msg}</Toast>
            <Header />
            <div style={{ minHeight: '70vh' }}>
                <Container style={{ background: 'white' }}>
                    <Spacebox padding="20px">
                        <Typography variant="h2" style={{ fontSize: '25px' }}>
                            {(new Date()).toString().substring(4, 7)}, {(new Date()).getFullYear()}
                        </Typography>
                        <Spacebox padding="10px" />
                        <Flexbox alignItems="center">
                            <img src="/svgs/calendar.svg" alt="calender" style={{ opacity: .6 }} />
                            <Spacebox padding="10px" />
                            <Flexbox alignItems="center" justifyContent="space-between" style={{ width: '100%' }}>
                                {dates.map((date, index) => (
                                    <div key={index} style={{ textAlign: 'center', background: index === 1 ? 'black' : '#f0f0f0', borderRadius: '10px', padding: '10px 20px', margin: 'auto 10px', opacity: index === 1 ? 1 : .5 }}>
                                        <small style={{ filter: index === 1 ? 'invert(1)' : 'invert(0)' }}>{day((new Date(date)).getDay())}</small>
                                        <Typography variant="h2" style={{ textAlign: 'center', opacity: .6, filter: index === 1 ? 'invert(1)' : 'invert(0)' }}>
                                            {(new Date(date)).toString().substring(7, 10)}
                                        </Typography>
                                    </div>
                                ))}
                            </Flexbox>
                        </Flexbox>
                    </Spacebox>
                </Container>
                <div style={{ background: '#f0f0f0' }}>
                    <Container style={{ padding: '20px' }}>
                        <Flexbox alignItems="center">
                            <div style={{ background: 'white', padding: '10px 20px', borderRadius: '10px' }}>
                                <span>Points</span>
                                {points && <Typography style={{ fontSize: '50px' }} variant="h2">
                                    {points}
                                </Typography>}
                                {loading && <Typography style={{ fontSize: '50px' }} variant="h2">
                                    {'...'}
                                </Typography>}
                                <small style={{ opacity: .5 }}>Total points awarded today</small>
                            </div>
                            <Spacebox padding="20px" />
                            <div style={{ background: 'white', padding: '10px 20px', borderRadius: '10px', width: '100%' }}>
                                <span>Quick Actions</span>
                                <Spacebox padding="25px" />
                                <Grid grid={2} gap="10px" style={{ width: '100%' }}>
                                    <Button style={{ background: 'var(--primary)', color: 'white', borderRadius: '5px', padding: '15px 20px', width: '100%' }} handleClick={() => setOpenScanner(true)}>
                                        Scan QR Code →
                                    </Button>
                                    <Button style={{ background: 'transparent', borderRadius: '5px', padding: '15px 20px', width: '100%' }} handleClick={() => openSidebar(setOpenBarcode)}>
                                        Enter barcode →
                                    </Button>
                                </Grid>
                            </div>
                        </Flexbox>
                        <Spacebox padding="10px" />
                        <div style={{ background: 'white', overflow: 'hidden', borderRadius: '10px' }}>
                            <table>
                                <thead>
                                    <tr>
                                        <td>Fullname</td>
                                        <td>Email</td>
                                        <td>Phone</td>
                                        <td>Points</td>
                                        <td>Registered</td>
                                    </tr>
                                </thead>
                                {isLoading && (
                                    <tbody>
                                        <tr>
                                            <td colSpan={4} style={{ textAlign: 'center' }}>
                                                <Skeleton variant="rounded" style={{ width: "100%" }} height={60} />
                                            </td>
                                        </tr>
                                    </tbody>
                                )}
                                {(paginationData && paginationData.length > 0) && (
                                    <tbody>
                                        {paginationData.map((user, index) => (
                                            <tr key={index}>
                                                <td>{user.fullname}</td>
                                                <td>{user.email}</td>
                                                <td>{user.phone}</td>
                                                <td>{user.points}</td>
                                                <td>{(new Date(user.timestamp)).toString().substring(0, 16)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                )}
                                {(paginationData && paginationData.length === 0) && (
                                    <tbody>
                                        <tr>
                                            <td colSpan={4}>
                                                <span style={{ display: 'block', textAlign: 'center', margin: '20px 0px' }} className="lighten-text">No records found</span>

                                            </td>
                                        </tr>
                                    </tbody>
                                )}
                            </table>
                        </div>
                        <Spacebox padding="10px" />
                        {users && <ArrowPagination data={users} limit={10} setShowData={setPaginationData} />}
                    </Container>
                </div>
            </div>
            <Footer />

            {(openScanner) && <ScanCode setOpen={setOpen} setSeverity={setSeverity} setLoading={setLoading} setToastMsg={setToastMsg} setOpenScanner={setOpenScanner} loadData={loadData} />}

            {(openBarcode) &&
                <div className="sidebar-bg"
                    style={{ top: 0, height: `100vh` }}
                >
                    <div className="sidebar">
                        <Flexbox justifyContent="space-between" alignItems="center">
                            <Typography variant="h2" style={{ fontSize: '32px' }}>
                                Enter Barcode
                            </Typography>
                            <IconButton onClick={() => {
                                closeSidebar(setOpenBarcode)
                                setUser(null)
                                setBarcode("")
                            }}>
                                <Close style={{ fontSize: '25px' }} />
                            </IconButton>
                        </Flexbox>
                        <Spacebox padding="20px" />
                        {!user && <div>
                            <input
                                type="text"
                                value={barcode}
                                onChange={(e) => setBarcode(e.target.value)}
                                placeholder="Enter barcode"
                            />
                            <Spacebox padding="10px" />
                            <Button style={{ background: 'var(--primary)', color: 'white', borderRadius: '100px', padding: '10px 0px', width: '100%' }} handleClick={getUser}>
                                {bLoading ? "Please wait" : "Proceed"}
                            </Button>
                        </div>}
                        {user && (
                            <div>
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
                                <Flexbox alignItems="center" justifyContent="center" style={{ background: '#f0f0f0', width: 'fit-content', margin: '0px auto', borderRadius: '100px', padding: '5px' }} >
                                    {navigators.map((nav, index) => (
                                        <div style={{ backgroundColor: index === currentTab && 'white', boxShadow: index === currentTab && 'rgba(86, 97, 107, 0.1) 0px 1px 2px 0px' }} className="cust-btn" key={index} onClick={() => setCurrentTab(index)}>
                                            <span style={{ color: index === currentTab ? '#131316' : '#56616B' }}>{nav.name}</span>
                                        </div>
                                    ))}
                                </Flexbox>
                                <Spacebox padding="10px" />
                                {currentTab === 0 && (
                                    <div>
                                        <span>Total Amount</span>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="Enter total purchase"
                                        />
                                        <Spacebox padding="10px" />
                                        <Flexbox alignItems="center" justifyContent="space-between">
                                            <Button style={{ background: 'var(--primary)', color: 'white', borderRadius: '10px', padding: '15px 10px', width: '100%' }} handleClick={handleClick}>
                                                {aLoading ? "Please wait" : "Award Points →"}
                                            </Button>
                                        </Flexbox>
                                    </div>
                                )}
                                {currentTab === 1 && <Button style={{ background: 'white', color: 'var(--primary)', borderRadius: '10px', padding: '15px 10px', width: '100%' }} handleClick={handleRedeem}>
                                    {rLoading ? "Please wait..." : "Redeem Points →"}
                                </Button>}
                            </div>
                        )}
                    </div>
                </div>}
        </div>
    );
}

export default Dashboard;