import { NextResponse } from "next/server";

export async function PUT(req: Request) {
    const token = process.env.EASYVISTA_API_TOKEN;
    const baseUrl = process.env.BASE_URL;
    const { searchParams } = new URL(req.url);
    const rfc_number = searchParams.get("rfc_number");

    if (!rfc_number) {
        return NextResponse.json({ error: "Missing RFC_NUMBER" }, { status: 400 });
    }

    const requestBody = {
        "end_action": {
            "description": "Closed by STEM API",
            "doneby_name": "API, Stem"
        }
    };

    try {
        const response = await fetch(`${baseUrl}/actions/${rfc_number}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Erreur API EasyVista : ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json({ message: `Ticket ${rfc_number} terminé avec succès`, data });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
