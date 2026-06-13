import streamlit as st
import streamlit.components.v1 as components
import os
import re

st.set_page_config(
    page_title="AuraTutor - Emotion-Aware Adaptive Learning Assistant",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Custom CSS to hide Streamlit margins, headers, and footers for a premium hackathon feel
st.markdown("""
<style>
    /* Hide Streamlit elements */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    
    /* Remove padding around main container */
    .reportview-container .main .block-container {
        padding-top: 0rem !important;
        padding-bottom: 0rem !important;
        padding-left: 0rem !important;
        padding-right: 0rem !important;
    }
    .main .block-container {
        padding: 0 !important;
        max-width: 100% !important;
    }
    iframe {
        border: none;
        width: 100% !important;
        height: 100vh !important;
    }
    div[data-testid="stVerticalBlock"] > div:first-child {
        padding: 0 !important;
    }
</style>
""", unsafe_allow_html=True)

def bundle_project():
    """Reads index.html, style.css, and JS modules, strips import/export syntax, 
    and bundles everything into a single standalone HTML string."""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    index_path = os.path.join(base_dir, "index.html")
    css_path = os.path.join(base_dir, "src", "css", "style.css")
    js_dir = os.path.join(base_dir, "src", "js")
    
    js_order = [
        "data.js",
        "state.js",
        "detector.js",
        "tutor.js",
        "planner.js",
        "analytics.js",
        "gamification.js",
        "app.js"
    ]
    
    # 1. Read index.html
    with open(index_path, "r", encoding="utf-8") as f:
        html = f.read()
        
    # 2. Read and inject style.css
    with open(css_path, "r", encoding="utf-8") as f:
        css = f.read()
    
    # Replace the stylesheet link with a style block
    html = re.sub(
        r'<link\s+rel="stylesheet"\s+href="src/css/style.css">',
        f"<style>\n{css}\n</style>",
        html
    )
    
    # 3. Read, clean, and concatenate all ES6 modules
    bundled_js = ""
    for js_file in js_order:
        path = os.path.join(js_dir, js_file)
        with open(path, "r", encoding="utf-8") as f:
            code = f.read()
            
        # Strip ES6 import lines (e.g. import store from "./state.js";)
        code = re.sub(r'import\s+.*?\s+from\s+["\'].*?["\'];?', '', code)
        
        # Clean export modifiers so variables become part of the same script scope
        code = re.sub(r'\bexport\s+default\s+', '', code)
        code = re.sub(r'\bexport\s+const\s+', 'const ', code)
        code = re.sub(r'\bexport\s+class\s+', 'class ', code)
        code = re.sub(r'\bexport\s+\{\s*.*?\s*\};?', '', code)
        
        bundled_js += f"\n// --- BUNDLED FROM {js_file} ---\n"
        bundled_js += code + "\n"
        
    # Replace the main script module link with our compiled script block
    html = re.sub(
        r'<script\s+type="module"\s+src="src/js/app.js"></script>',
        f"<script>\n{bundled_js}\n</script>",
        html
    )
    
    return html

try:
    html_content = bundle_project()
    # Embed the compiled standalone HTML inside the Streamlit layout (100% height)
    components.html(html_content, height=900, scrolling=True)
except Exception as e:
    st.error(f"Error bundling project: {e}")
