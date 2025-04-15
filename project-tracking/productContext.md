# Dorkroom React Native App - Product Context

## Core Purpose

Dorkroom is a specialized photography tool designed to assist both professional and amateur photographers with darkroom printing, film developing, and photo shooting calculations. The app serves as a digital companion for traditional photography processes, bridging the gap between analog techniques and modern technology.

## Problem Statement

Photographers working in darkrooms or with film often need to perform complex calculations for:

- Print border positioning
- Film development timing
- Exposure calculations
- Aspect ratio adjustments

These calculations are traditionally done manually or with separate tools, which can be time-consuming and prone to errors. Dorkroom centralizes these tools in a single, accessible application.

## User Personas

### Professional Photographer

- Needs precise calculations for consistent results
- Works in professional darkroom settings
- Values accuracy and efficiency
- May need to work with various paper sizes and aspect ratios

### Amateur Photographer

- Learning darkroom techniques
- Needs guidance and educational tools
- Values simplicity and clear instructions
- May need help with basic calculations

### Film Enthusiast

- Works with various film types
- Needs development timing calculations
- Values portability of tools
- May need offline access to calculations

## Key Features and Functionality

### Print Border Calculator

- Core feature of the application
- Helps users position blades on adjustable darkroom easels
- Supports various paper sizes and aspect ratios
- Provides visual feedback for positioning

### Film Development Tools

- Timing calculations for different film types
- Temperature compensation
- Development process tracking

### Photography Calculators

- Exposure calculations
- Depth of field calculations
- Lighting ratio tools

### Educational Content

- Photography Knowledge Base with comprehensive articles and cross-references
- Technique Guides with step-by-step visual instructions
- Formula Explainers that detail the math behind calculator functions
- Film and Paper Database with specifications and usage recommendations
- Interactive Learning Modules for self-paced education
- Contextual Help System integrated with calculators

## User Experience Goals

### Accessibility

- Intuitive interface for quick calculations
- Clear visual feedback
- Offline functionality for darkroom use
- Cross-platform availability

### Reliability

- Accurate calculations
- Consistent performance
- Data persistence
- Error prevention

### Platform-Specific Experience

#### Web Experience

- Optimized for desktop workflows
- Keyboard shortcuts for power users
- Responsive design for various screen sizes
- Browser compatibility across major browsers
- Quick access to all calculators and reference materials

#### Mobile Experience

- Touch-optimized controls
- Native feeling navigation and interactions
- Platform-specific design patterns (iOS, Android)
- Optimized for on-the-go use in darkroom environments
- Quick access to frequently used calculations

### Educational Value

- Clear explanations of calculations
- Helpful tips and guidance
- Process documentation
- Best practices information
- Comprehensive knowledge base with searchable articles
- Interactive learning modules with progress tracking
- Context-sensitive help integrated with calculators
- Visual guides and demonstrations

## Value Proposition

Dorkroom provides photographers with a reliable, accurate, and accessible set of tools that streamline the technical aspects of darkroom work and film development. By centralizing these calculations in a modern, user-friendly application, it saves time, reduces errors, and helps photographers focus on their creative work.

## User Workflows

### Print Border Calculation

1. Select paper size
2. Choose aspect ratio
3. Input desired border dimensions
4. Receive blade positioning instructions
5. Apply settings to darkroom easel

**Web-specific**: Precise input via keyboard, larger visualization, ability to print instructions  
**Mobile-specific**: Touch sliders for quick adjustments, saved presets for darkroom use

### Print Resizing

1. Input original print size and print exposure time
2. Input intended new print size (larger or smaller)
3. Output new exposure time in both seconds and change in stops
4. Optionally save custom preset with name.

**Web-specific**: Tabular format for quick comparison of multiple size changes  
**Mobile-specific**: Simple interface optimized for single calculations, history of recent calculations

### Stop-Based Exposure Calculator

1. Input original exposure time
2. Select change in stops, either by manual number entry, or buttons that add or remove 1/2, 1/3, or 1 stop
3. Output new calculated exposure time

**Web-specific**: Keyboard shortcuts for quick adjustments, detailed visual feedback  
**Mobile-specific**: Touch-friendly adjustment buttons, simple display optimized for darkroom visibility

### Camera Exposure Calculator

1. Input original exposure (exposure time, aperture, ISO)
2. Select value to change (exposure time, aperture, ISO) and what to change it to
3. Output equivalent exposure (ex. 1/60th sec, f5.6, ISO 100 = 1/120th sec, f5.6, ISO 200)

### Reciprocity Calculator

1. Input metered exposure time
2. Input film type or custom reciprocity factor (e.g. 1.36)
3. Calculate the following: MeteredTime^ReciprocityFactor (e.g. 30 seconds^1.36 = 102.1 seconds)
4. Output the new exposure time

### Developer Dilution Calculator

1. Input chemical dilution in at least two, optionally three, boxes (e.g. 1 + 31, 1 + 50 + 100).
2. Optionally select dilution notation (plus or colon)
3. Output dilution in form of "Chemical: x ml, Water: z ml" or "Chemical 1: x ml, Chemical 2: y ml, Water: z ml)

### Push/Pull Calculator

1. Input original developing time for box speed ISO
2. Select push/pull type in list based on following:

```
Standard Developer
    1 stop push = (x1.5)
    2 stop push = (x2.25)
    3 stop push = (x4.5)
Compensating Developer
    1 stop push = (x1.4)
    2 stop push = (x1.85)
    3 stop push = (x2.5)
TMax Films
    1 stop push = no change
    2 stop push = (x1.33)
    3 stop push = (x1.66)
```

3. Output new development time

### Film Development

1. Select film type
2. Input development parameters
3. Calculate timing
4. Track development process
5. Record results

### Knowledge Base Navigation

1. Browse categories or search for specific topics
2. Access detailed articles with images and diagrams
3. Follow cross-references to related topics
4. Bookmark or save articles for future reference
5. Optionally contribute personal notes (for logged-in users)

### Interactive Learning

1. Select a learning module based on interest or skill level
2. Progress through sequential lessons with interactive elements
3. Complete practice exercises and quizzes
4. Track progress through modules
5. Apply learned concepts directly in relevant calculators

## Success Criteria

- Reduction in calculation errors
- Time saved in darkroom preparation
- Improved consistency in print quality
- Positive user feedback on accuracy
- Increased user confidence in technical aspects

## Future Considerations

- Integration with digital photography tools
- Community features for sharing techniques
- Advanced calculation options
- Custom formula support
- Expanded film type database
- User-contributed educational content
- Video tutorials and demonstrations
- Expert masterclasses and specialized technique guides
- Integration with photography schools and curriculum

---

## Current State Note (2025)

- Print Border Calculator: In Progress
- Print Resizing Calculator: Started
- Stop-Based Exposure, Camera Exposure, Reciprocity Calculators: Completed
- Developer Dilution, Push/Pull Calculators: Not Started
- Web and mobile interface work: Ongoing
- Offline functionality, data persistence, preset systems: Not yet implemented
- Testing and performance optimization: Planned but not started
