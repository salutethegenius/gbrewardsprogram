import { IconButton, Typography } from "@mui/material";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import cookies from "../utilities/Cookies";
import { useEffect, useRef, useState } from "react";
import Toast from "../components/Toast";
import Spacebox from "../components/Spacebox";
import Grid from "../components/Grid";
import { LeapFrog } from '@uiball/loaders';
import { QRCodeSVG } from 'qrcode.react';
import Flexbox from "../components/Flexbox";
import { ChevronRight, Close, Refresh } from "@mui/icons-material";
import { isMobile } from "react-device-detect";
import useFetch from "../hooks/useFetch";
import Company from "../utilities/Company";
import OnAuth from "../components/onAuth";
import { updateuser } from "../features/users";
import ArrowPagination from "../components/ArrowPagination";
import requests from "../handlers/requests";

const Dashboard = ({ title }) => {

    document.querySelector("title").innerHTML = title
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const navigators = [
        {
            name: isMobile ? 'Awarded' : 'Awarded Points',
        },
        {
            name: isMobile ? 'Redeemed' : 'Redeemed Points',
        },
    ]

    const [currentTab, setCurrentTab] = useState(0)


    const token = cookies.getCookies('token');
    const [user, setUser] = useState(null)

    const [open, setOpen] = useState(false);
    const [severity, setSeverity] = useState('success');
    const [msg, setToastMsg] = useState('');

    const [loading, setLoading] = useState(false)

    const [openHistory, setOpenHistory] = useState(false)

    const [paginationAwarded, setPaginationAwarded] = useState(null)
    const [paginationRedeemed, setPaginationRedeemed] = useState(null)



    const { data: history, error, isLoading } = useFetch(`${process.env.REACT_APP_SERVER}api/history?token=${token}&sid=${Company.store_id}`)

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

    const getAwarded = (array) => {
        return array.filter(arr => arr.type === 'awarded')
    }

    const getRedeemed = (array) => {
        return array.filter(arr => arr.type === 'redeemed')
    }

    const reloadRef = useRef(null)

    const reload = () => {
        const url = `${process.env.REACT_APP_SERVER}api/user?token=${token}&sid=${Company.store_id}`
        reloadRef.current.classList.add('rotate')
        setLoading(true)

        requests.makeGet(url, setOpen, setSeverity, setToastMsg, setLoading,
            (res) => {
                setUser(res.user)
                dispatch(updateuser(res.user))
                reloadRef.current.classList.remove('rotate')
            },
            "Data updated"
        )
    }

    const greet = () => {
        let date = new Date()
        let hour = date.getHours()
        if(hour < 12)
            return 'Good Morning'
        else if(hour === 12 || hour < 18)
            return 'Good Day'
        else if (hour === 18 || hour < 21)
            return 'Good Evening'
        else
            return 'Good Night'
    }


    useEffect(() => {
        const stringify_user = cookies.getCookies('user');
        if (stringify_user.length > 10) {
            const user_ = JSON.parse(stringify_user)
            dispatch(updateuser(user_))
            setUser(user_)
        } else {
            navigate('/')
        }
        //eslint-disable-next-line
    }, [])

    return (
        <OnAuth>
            <div className="dashboard-page">
                <Toast open={open} setOpen={setOpen} severity={severity} timer={4000}>{msg}</Toast>
                {(user && history) && <div>
                    <small>{greet()},</small>
                    <Typography className="bold" style={{ fontSize: isMobile ? '30px' : '40px' }} variant="h2">
                        {user.fullname}
                    </Typography>
                    <Spacebox padding="40px" />
                    <Grid grid={isMobile ? 1 : 2} gap={"20px"}>
                        <div style={{ padding: '20px', background: '#f0f0f0', minWidth: '250px', borderRadius: '20px' }}>
                            <Flexbox alignItems="center" justifyContent="space-between">
                                <Typography style={{ fontSize: '20px', marginBottom: 0 }} className="bold">
                                    Total Points
                                </Typography>
                                <IconButton onClick={() => reload()}>
                                    <Refresh style={{ fontSize: isMobile ? '20px' : '30px' }} ref={reloadRef} />
                                </IconButton>
                            </Flexbox>
                            <small>Total points earned</small>
                            <Typography style={{ fontSize: isMobile ? '60px' : '80px', opacity: loading && 0 }} variant="h2">
                                {(user.points).toLocaleString()}
                            </Typography>
                            {/* Delete from here */}
                            {isMobile && <div>
                                <Spacebox padding="10px" />
                                <small>Scan this QR code</small>
                                <Spacebox padding="2px" />
                                <QRCodeSVG value={user.id} style={{ width: '250px', height: '250px', position: 'relative', margin: '0px auto', display: 'block', }} />
                            </div>}
                        </div>
                        {!isMobile && <div style={{ padding: '20px', background: '#f0f0f0', minWidth: '250px', borderRadius: '20px' }}>
                            <Typography style={{ fontSize: '20px', marginBottom: 0 }} className="bold">
                                Points History
                            </Typography>
                            <small>All time points history</small>
                            {!isMobile && <Spacebox padding="40px" />}
                            <Flexbox justifyContent="flex-end">
                                <IconButton onClick={() => openSidebar(setOpenHistory)}>
                                    <ChevronRight />
                                </IconButton>
                            </Flexbox>
                        </div>}
                        {isMobile && <div style={{ padding: '20px', background: '#f0f0f0', minWidth: '250px', borderRadius: '20px' }}>
                            <Flexbox justifyContent="space-between" alignItems="center">
                                <div>
                                    <Typography style={{ fontSize: '20px', marginBottom: 0 }} className="bold">
                                        Points History
                                    </Typography>
                                    <small>All time points history</small>
                                </div>
                                <IconButton onClick={() => openSidebar(setOpenHistory)}>
                                    <ChevronRight />
                                </IconButton>
                            </Flexbox>
                        </div>}
                        {!isMobile && <div>
                            <small>Scan this QR code</small>
                            <Spacebox padding="2px" />
                            <QRCodeSVG value={user.id} style={{ width: '250px', height: '250px', position: 'relative' }} />
                        </div>}
                        <div>
                            <small>or</small>
                            <Typography>
                                Enter barcode number
                            </Typography>
                            <Spacebox padding="2px" />
                            <Typography style={{ fontSize: isMobile ? '20px' : '35px' }} variant="h2">
                                {user.id}
                            </Typography>
                        </div>
                    </Grid>

                    {(openHistory) &&
                        <div className="sidebar-bg"
                            style={{ top: 0, height: `100vh` }}
                        >
                            <div className="sidebar">
                                <Flexbox justifyContent="space-between" alignItems="center">
                                    <Typography variant="h2" style={{ fontSize: '32px' }}>
                                        Points History
                                    </Typography>
                                    <IconButton onClick={() => closeSidebar(setOpenHistory)}>
                                        <Close style={{ fontSize: '25px' }} />
                                    </IconButton>
                                </Flexbox>
                                <div className="">
                                    <Spacebox padding="10px" />
                                    <Flexbox alignItems="center" justifyContent="center" style={{ background: '#f0f0f0', width: 'fit-content', margin: '0px auto', borderRadius: '100px', padding: '5px' }} >
                                        {navigators.map((nav, index) => (
                                            <div style={{ backgroundColor: index === currentTab && 'white', boxShadow: index === currentTab && 'rgba(86, 97, 107, 0.1) 0px 1px 2px 0px' }} className="cust-btn" key={index} onClick={() => setCurrentTab(index)}>
                                                <span style={{ color: index === currentTab ? '#131316' : '#56616B' }}>{nav.name}</span>
                                            </div>
                                        ))}
                                    </Flexbox>
                                    <Spacebox padding="10px" />
                                    {currentTab === 0 && <div>
                                        {getAwarded(history).length > 0 && <div>
                                            {paginationAwarded && <div>
                                                {paginationAwarded.map((item, index) => (
                                                    <div key={index}>
                                                        <Flexbox alignItems="center" justifyContent="space-between" style={{ background: '#f0f0f0', borderRadius: '10px', padding: '10px' }}>
                                                            <div>
                                                                <small style={{ opacity: .5, fontSize: '10px' }}>Date</small>
                                                                <Spacebox padding="2px" />
                                                                <span>{(new Date(item.timestamp)).toString().substring(4, 10)}</span>
                                                            </div>
                                                            <div>
                                                                <small style={{ opacity: .5, fontSize: '10px' }}>Points</small>
                                                                <Spacebox padding="2px" />
                                                                <span>{item.point}</span>
                                                            </div>
                                                            <div>
                                                                <small style={{ opacity: .5, fontSize: '10px' }}>Amount</small>
                                                                <Spacebox padding="2px" />
                                                                <span>${item.amount}</span>
                                                            </div>
                                                        </Flexbox>
                                                        <Spacebox padding="5px" />
                                                    </div>
                                                ))}
                                            </div>}
                                            <Spacebox padding="5px" />
                                            <ArrowPagination data={getAwarded(history)} limit={5} setShowData={setPaginationAwarded} />

                                        </div>}
                                        {getAwarded(history).length < 1 && <div style={{ textAlign: 'center' }}>
                                            <small>You have no records</small>
                                        </div>}
                                    </div>}
                                    {currentTab === 1 && <div>
                                        {getRedeemed(history).length > 0 && <div>
                                            {paginationRedeemed && <div>
                                                {paginationRedeemed.map((item, index) => (
                                                    <div key={index}>
                                                        <Flexbox alignItems="center" justifyContent="space-between" style={{ background: '#f0f0f0', borderRadius: '10px', padding: '10px' }}>
                                                            <div>
                                                                <small style={{ opacity: .5, fontSize: '10px' }}>Date</small>
                                                                <Spacebox padding="2px" />
                                                                <span>{(new Date(item.timestamp)).toString().substring(4, 10)}</span>
                                                            </div>
                                                            <div>
                                                                <small style={{ opacity: .5, fontSize: '10px' }}>Points</small>
                                                                <Spacebox padding="2px" />
                                                                <span>{item.point}</span>
                                                            </div>
                                                        </Flexbox>
                                                        <Spacebox padding="5px" />
                                                    </div>
                                                ))}
                                            </div>}
                                            <Spacebox padding="5px" />
                                            <ArrowPagination data={getRedeemed(history)} limit={5} setShowData={setPaginationRedeemed} />
                                        </div>}
                                        {getRedeemed(history).length < 1 && <div style={{ textAlign: 'center' }}>
                                            <small>You have no records</small>
                                        </div>}
                                    </div>}
                                    <Spacebox padding="20px" />
                                    <Spacebox padding="20px" />
                                </div>
                            </div>
                        </div>}
                </div>}
                {error && (<Typography>An error occured</Typography>)}
                {isLoading && (
                    <Flexbox alignItems="center" style={{ height: '100%' }} justifyContent="center">
                        <LeapFrog size={20} color="var(--primary)" />
                    </Flexbox>
                )}
            </div>
        </OnAuth>
    );
}

export default Dashboard;