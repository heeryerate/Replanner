class Destination:
    def __init__(self, id, name, location, open_hours, category, preferences, summary):
        self.id = id
        self.name = name
        self.location = location
        self.open_hours = open_hours
        self.category = category
        self.preferences = preferences
        self.summary = summary

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'location': self.location,
            'openHours': self.open_hours,
            'category': self.category,
            'preferences': self.preferences,
            'summary': self.summary
        }

class TripPlan:
    def __init__(self, destinations, total_cost, transportation):
        self.destinations = destinations
        self.total_cost = total_cost
        self.transportation = transportation

    def to_dict(self):
        return {
            'destinations': [dest.to_dict() for dest in self.destinations],
            'totalCost': self.total_cost,
            'transportation': self.transportation
        }

class PlanGenerator:
    def __init__(self):
        self.destinations = [
            Destination(
                "1",
                "Eiffel Tower",
                "Paris, France",
                "9:00 AM - 11:45 PM",
                "Landmark",
                ["Historical", "Scenic", "Popular"],
                "Iconic iron lattice tower offering panoramic views of Paris"
            ),
            Destination(
                "2",
                "Louvre Museum",
                "Paris, France",
                "9:00 AM - 6:00 PM",
                "Museum",
                ["Art", "Historical", "Cultural"],
                "World's largest art museum and historic monument"
            ),
            Destination(
                "3",
                "Notre-Dame Cathedral",
                "Paris, France",
                "8:00 AM - 6:45 PM",
                "Religious",
                ["Historical", "Architectural", "Cultural"],
                "Medieval Catholic cathedral with Gothic architecture"
            ),
            Destination(
                "4",
                "Montmartre",
                "Paris, France",
                "24/7",
                "District",
                ["Artistic", "Historic", "Scenic"],
                "Historic district with artistic heritage"
            )
        ]

    def generate_options(self, budget, transportation, destination_ids=None):
        # Filter destinations if specific IDs are provided
        available_destinations = self.destinations
        if destination_ids:
            available_destinations = [d for d in self.destinations if d.id in destination_ids]

        print(available_destinations)
        
        plans = []
        
        # Generate 3 different plans
        for i in range(3):
            # Calculate cost based on transportation
            transport_cost = {
                'car': 50,
                'train': 30,
                'bus': 20,
                'flight': 200
            }.get(transportation, 50)
            
            # Select destinations
            selected_destinations = available_destinations[:i+2]
            
            # Calculate total cost
            total_cost = transport_cost + (len(selected_destinations) * 20)
            
            # Ensure the plan fits within budget
            if total_cost <= budget:
                plans.append(TripPlan(
                    destinations=selected_destinations,
                    total_cost=total_cost,
                    transportation=transportation
                ))
        
        return plans 