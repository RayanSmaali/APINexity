import { NextResponse } from "next/server";

export async function PUT(req: Request, context: { params: Promise<{ rfc_number: string }> }) {
    try {
        const token = process.env.EASYVISTA_API_TOKEN;
        const baseUrl = process.env.BASE_URL;
        const { rfc_number } = await context.params;

        console.log("🔍 [DEBUG] RFC Number Received:", rfc_number);

        if (!rfc_number) {
            console.error("❌ RFC_NUMBER is missing!");
            return NextResponse.json({ error: "Missing RFC_NUMBER" }, { status: 400 });
        }

        const requestBody = {
            "end_action": {
                "description": "Closed by STEM API",
                "doneby_name": "API, Stem"
            }
        };

        console.log("📡 [DEBUG] Sending PUT request to:", `${baseUrl}/actions/${rfc_number}`);
        console.log("📄 [DEBUG] Request Body:", JSON.stringify(requestBody));

        const response = await fetch(`${baseUrl}/actions/${rfc_number}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        console.log("🔄 [DEBUG] API Response Status:", response.status);

        const responseText = await response.text();
        console.log("📄 [DEBUG] API Response Text:", responseText);

        if (!response.ok) {
            throw new Error(`EasyVista API Error: ${responseText}`);
        }

        const data = JSON.parse(responseText);
        return NextResponse.json({ message: `Ticket ${rfc_number} successfully closed`, data });
    } catch (error) {
        console.error("❌ [ERROR] API Request Failed:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
