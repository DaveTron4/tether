import type { Response } from 'express';
import type { AuthRequest } from '../models/authRequest.interface.js';
import { pool } from '../config/database.js';

// Controller functions for managing client devices (The "Device Garage")

// Get all devices for the entire store
const getAllDevices = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        
        const result = await pool.query(
            'SELECT * FROM client_devices WHERE tenant_id = $1 ORDER BY created_at DESC', 
            [req.user.tenant_id]
        );
        
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching all devices:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get a single device by ID
const getDeviceById = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        const { id } = req.params;
        
        const result = await pool.query(
            'SELECT * FROM client_devices WHERE id = $1 AND tenant_id = $2', 
            [id, req.user.tenant_id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Device not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching device:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get all devices belonging to a specific client (Crucial for the CRM Tab)
const getDevicesByClientId = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        const { client_id } = req.params; // Assuming route is like: /api/clients/:client_id/devices
        
        if (!client_id) {
            return res.status(400).json({ error: 'Client ID is required' });
        }

        const result = await pool.query(
            'SELECT * FROM client_devices WHERE client_id = $1 AND tenant_id = $2 ORDER BY created_at DESC', 
            [client_id, req.user.tenant_id]
        );

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching devices for client:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Create a new device for a client
const createDevice = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        
        const { client_id, device_type, manufacturer, model, imei_serial, color, device_passcode } = req.body;

        // Validate required fields
        if (!client_id || !model) {
            return res.status(400).json({ error: 'Client ID and Device Model are required' });
        }

        const result = await pool.query(
            `INSERT INTO client_devices 
            (tenant_id, client_id, device_type, manufacturer, model, imei_serial, color, device_passcode) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [req.user.tenant_id, client_id, device_type, manufacturer, model, imei_serial, color, device_passcode]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating device:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update an existing device
const updateDevice = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        const { id } = req.params;
        
        const { device_type, manufacturer, model, imei_serial, color, device_passcode } = req.body;

        const result = await pool.query(
            `UPDATE client_devices SET 
                device_type = COALESCE($1, device_type), 
                manufacturer = COALESCE($2, manufacturer), 
                model = COALESCE($3, model), 
                imei_serial = COALESCE($4, imei_serial),
                color = COALESCE($5, color),
                device_passcode = COALESCE($6, device_passcode)
            WHERE id = $7 AND tenant_id = $8 RETURNING *`,
            [device_type, manufacturer, model, imei_serial, color, device_passcode, id, req.user.tenant_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Device not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error updating device:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete a device
const deleteDevice = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        const { id } = req.params;
        
        const result = await pool.query(
            'DELETE FROM client_devices WHERE id = $1 AND tenant_id = $2 RETURNING *', 
            [id, req.user.tenant_id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Device not found' });
        }
        
        res.status(200).json({ message: 'Device deleted successfully' });
    } catch (err) {
        console.error('Error deleting device:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export default {
    getAllDevices,
    getDeviceById,
    getDevicesByClientId,
    createDevice,
    updateDevice,
    deleteDevice
};