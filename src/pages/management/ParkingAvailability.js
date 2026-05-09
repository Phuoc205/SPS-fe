import React, { useEffect, useState } from "react";

const BASE_URL = "http://localhost:5000";

export default function ParkingAvailability() {

    const [slots, setSlots] = useState([]);




    // =========================
    // LOAD SLOT DATA
    // =========================

    useEffect(() => {

        fetchSlots();

        // refresh every 5 seconds
        const interval = setInterval(() => {

            fetchSlots();

        }, 5000);

        return () => clearInterval(interval);

    }, []);




    // =========================
    // GET ALL SLOTS
    // =========================

    async function fetchSlots() {

        try {

            const response = await fetch(
                `${BASE_URL}/api/slots`
            );

            if(!response.ok) {

                throw new Error(
                    "Cannot fetch slots"
                );
            }

            const data = await response.json();

            setSlots(data);

        }
        catch(error) {

            console.error(error);
        }
    }




    // =========================
    // UPDATE SLOT STATUS
    // =========================

    async function updateSlot(slot) {

        try {

            let nextStatus = "AVAILABLE";

            if(slot.status === "AVAILABLE") {

                nextStatus = "OCCUPIED";
            }
            else if(slot.status === "OCCUPIED") {

                nextStatus = "ERROR";
            }
            else {

                nextStatus = "AVAILABLE";
            }



            const response = await fetch(

                `${BASE_URL}/api/slots/${slot.id}`,

                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        name: slot.name,

                        status: nextStatus,

                        parkingLotId:
                            slot.parkingLotId
                    })
                }
            );



            if(!response.ok) {

                throw new Error(
                    "Update slot failed"
                );
            }



            fetchSlots();

        }
        catch(error) {

            console.error(error);
        }
    }




    // =========================
    // COUNTERS
    // =========================

    const occupiedCount =

        slots.filter(
            slot => slot.status === "OCCUPIED"
        ).length;




    const availableCount =

        slots.filter(
            slot => slot.status === "AVAILABLE"
        ).length;




    const errorCount =

        slots.filter(
            slot => slot.status === "ERROR"
        ).length;




    // =========================
    // UI
    // =========================

    return (

        <div
            style={{
                padding: "30px",
                background: "#f3f4f6",
                minHeight: "100vh"
            }}
        >

            <h1
                style={{
                    fontSize: "40px",
                    fontWeight: "bold",
                    marginBottom: "30px"
                }}
            >
                Parking Availability
            </h1>




            {/* STATS */}

            <div
                style={{
                    display: "flex",
                    gap: "20px",
                    marginBottom: "40px",
                    flexWrap: "wrap"
                }}
            >

                <div style={cardStyle}>

                    <h2>Total</h2>

                    <p style={numberStyle}>
                        {slots.length}
                    </p>

                </div>




                <div
                    style={{
                        ...cardStyle,
                        background: "#dcfce7"
                    }}
                >

                    <h2>Available</h2>

                    <p
                        style={{
                            ...numberStyle,
                            color: "green"
                        }}
                    >
                        {availableCount}
                    </p>

                </div>




                <div
                    style={{
                        ...cardStyle,
                        background: "#fee2e2"
                    }}
                >

                    <h2>Occupied</h2>

                    <p
                        style={{
                            ...numberStyle,
                            color: "red"
                        }}
                    >
                        {occupiedCount}
                    </p>

                </div>




                <div
                    style={{
                        ...cardStyle,
                        background: "#fef3c7"
                    }}
                >

                    <h2>Error</h2>

                    <p
                        style={{
                            ...numberStyle,
                            color: "#d97706"
                        }}
                    >
                        {errorCount}
                    </p>

                </div>

            </div>




            {/* SLOT GRID */}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(6, 1fr)",
                    gap: "20px"
                }}
            >

                {slots.map(slot => {

                    let backgroundColor = "#22c55e";

                    if(slot.status === "OCCUPIED") {

                        backgroundColor = "#ef4444";
                    }

                    if(slot.status === "ERROR") {

                        backgroundColor = "#f59e0b";
                    }

                    return (

                        <div
                            key={slot.id}

                            onClick={() =>
                                updateSlot(slot)
                            }

                            style={{

                                background:
                                    backgroundColor,

                                color: "white",

                                height: "120px",

                                borderRadius: "12px",

                                display: "flex",

                                flexDirection: "column",

                                justifyContent: "center",

                                alignItems: "center",

                                fontWeight: "bold",

                                cursor: "pointer",

                                transition: "0.2s",

                                boxShadow:
                                    "0 2px 5px rgba(0,0,0,0.1)"
                            }}
                        >

                            <div
                                style={{
                                    fontSize: "24px"
                                }}
                            >
                                {slot.name}
                            </div>

                            <div>
                                {slot.status}
                            </div>

                        </div>
                    );
                })}

            </div>

        </div>
    );
}




// =========================
// STYLES
// =========================

const cardStyle = {

    background: "white",

    padding: "20px",

    borderRadius: "12px",

    width: "200px",

    boxShadow:
        "0 2px 5px rgba(0,0,0,0.1)"
};




const numberStyle = {

    fontSize: "32px",

    fontWeight: "bold",

    marginTop: "10px"
};