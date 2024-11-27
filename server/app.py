from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import base64
import graphviz

app = Flask(__name__)
CORS(app)

# Helper function to parse expression into a tree
def parse_expression(expr):
    operators = ['+', '-', '*', '/']
    last_operator_index = -1

    for op in operators:
        index = expr.rfind(op)
        if index > last_operator_index:
            last_operator_index = index

    if last_operator_index == -1:
        return {"value": expr, "children": []}

    left = expr[:last_operator_index]
    right = expr[last_operator_index + 1:]
    operator = expr[last_operator_index]

    return {
        "value": operator,
        "children": [parse_expression(left), parse_expression(right)],
    }

# Function to generate a Graphviz tree
def generate_graphviz_tree(node, graph=None, parent=None, counter=None):
    if graph is None:
        graph = graphviz.Digraph(format='png')
        counter = [0]  # Counter for unique IDs

    node_id = f"node{counter[0]}"
    counter[0] += 1
    graph.node(node_id, label=node['value'])

    if parent:
        graph.edge(parent, node_id)

    for child in node['children']:
        generate_graphviz_tree(child, graph, node_id, counter)

    return graph

@app.route('/validate', methods=['POST'])
def validate_expression():
    try:
        data = request.json
        expression = data.get("expression", "")

        # Validate the expression
        if not re.match(r"^[0-9+\-*/(). ]+$", expression):
            return jsonify({"error": "Invalid expression"}), 400

        result = eval(expression)
        return jsonify({"expression": expression, "result": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/generate-tree', methods=['POST'])
def generate_tree():
    try:
        data = request.json
        expression = data.get("expression", "")

        # Validate the expression
        if not re.match(r"^[0-9+\-*/(). ]+$", expression):
            return jsonify({"error": "Invalid expression"}), 400

        tree = parse_expression(expression)

        # Generate Graphviz tree
        graph = generate_graphviz_tree(tree)
        graph.render('output', format='png', cleanup=True)

        # Convert the image to Base64
        with open('output.png', 'rb') as f:
            image_data = f.read()
        image_base64 = base64.b64encode(image_data).decode('utf-8')

        return jsonify({"image": image_base64})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
