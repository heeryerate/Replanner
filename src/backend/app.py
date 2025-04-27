from flask import Flask, request, jsonify
from flask_cors import CORS
from plan_generator import PlanGenerator
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

generator = PlanGenerator()

@app.route('/api/destinations', methods=['GET'])
def get_destinations():
    try:
        destinations = [dest.to_dict() for dest in generator.destinations]
        return jsonify({
            'success': True,
            'destinations': destinations
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/generate-plans', methods=['POST'])
def generate_plans():
    try:
        data = request.get_json()
        budget = float(data.get('budget'))
        transportation = data.get('transportation')
        destination_ids = data.get('destination_ids', [])
        
        if not budget or not transportation:
            return jsonify({'error': 'Missing required parameters'}), 400
            
        options = generator.generate_options(budget, transportation, destination_ids)
        
        # Convert plans to JSON-serializable format
        plans = [plan.to_dict() for plan in options]
        
        return jsonify({
            'success': True,
            'plans': plans
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5002) 