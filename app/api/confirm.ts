import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    const { rfc_number } = req.query;
    const token = process.env.EASYVISTA_API_TOKEN;
    const baseUrl = process.env.BASE_URL;

    const requestBody = {
        "end_action": {
            "description": "Closed by STEM API",
            "doneby_name": "API, Stem"
        }
    };

    try {
        const response = await fetch(`${baseUrl}/actions/${rfc_number}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Erreur API EasyVista : ${response.statusText}`);
        }

        const data = await response.json();
        res.status(200).json({ message: `Ticket ${rfc_number} terminé avec succès`, data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
